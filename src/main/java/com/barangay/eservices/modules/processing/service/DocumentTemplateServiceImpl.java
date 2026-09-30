package com.barangay.eservices.modules.processing.service;

import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.processing.dto.DocumentPreviewDTO;
import com.barangay.eservices.modules.processing.entity.DocumentRelease;
import com.barangay.eservices.modules.processing.repository.DocumentReleaseRepository;
import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.repository.DocumentRequestRepository;
import com.barangay.eservices.modules.users.entity.RoleName;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.util.DateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentTemplateServiceImpl implements DocumentTemplateService {

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private DocumentReleaseRepository releaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public DocumentPreviewDTO generateDocumentPreview(Long requestId) {
        DocumentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", requestId));

        Optional<DocumentRelease> releaseOpt = releaseRepository.findByDocumentRequestId(requestId);

        String docNumber;
        String orNumber;
        BigDecimal fee = request.getServiceItem().getFee();
        LocalDate issueDate = LocalDate.now();
        LocalDate validUntil = issueDate.plusMonths(6); // Standard 6-month validity for barangay certificates

        String approverName = "Hon. Barangay Captain";
        String approverTitle = "Punong Barangay";

        // Find configured approver
        List<User> approvers = userRepository.findByRoleName(RoleName.ROLE_APPROVER);
        if (!approvers.isEmpty()) {
            approverName = "Hon. " + approvers.get(0).getFullName();
        }

        if (releaseOpt.isPresent()) {
            DocumentRelease release = releaseOpt.get();
            docNumber = release.getIssuedDocumentNumber();
            orNumber = release.getOfficialReceiptNumber() != null ? release.getOfficialReceiptNumber() : "N/A";
            if (release.getPaymentAmount() != null) {
                fee = release.getPaymentAmount();
            }
            if (release.getReleaseDate() != null) {
                issueDate = release.getReleaseDate().toLocalDate();
                validUntil = issueDate.plusMonths(6);
            }
            if (release.getOfficialApprover() != null) {
                approverName = "Hon. " + release.getOfficialApprover().getFullName();
            }
        } else {
            docNumber = "DRAFT-" + request.getServiceItem().getServiceCode() + "-" + request.getReferenceNumber();
            orNumber = "PENDING RELEASE";
        }

        String recipient = request.getResident().getFullName();
        String address = request.getResident().getAddress() != null ? request.getResident().getAddress() : "Barangay Cansojong, Talisay City, Cebu";
        String purpose = request.getPurpose() != null ? request.getPurpose() : "General Reference";

        String verificationUrl = "http://localhost:5173/verify?control=" + docNumber;

        DocumentPreviewDTO dto = new DocumentPreviewDTO();
        dto.setRequestId(request.getId());
        dto.setReferenceNumber(request.getReferenceNumber());
        dto.setServiceName(request.getServiceItem().getName());
        dto.setServiceCode(request.getServiceItem().getServiceCode());
        dto.setRecipientName(recipient);
        dto.setAddress(address);
        dto.setPurpose(purpose);
        dto.setIssuedDocumentNumber(docNumber);
        dto.setOfficialReceiptNumber(orNumber);
        dto.setPaymentAmount(fee);
        dto.setIssueDate(issueDate);
        dto.setValidUntil(validUntil);
        dto.setOfficialApproverName(approverName);
        dto.setOfficialApproverTitle(approverTitle);
        dto.setCurrentStatus(request.getCurrentStatus().name());
        dto.setVerificationUrl(verificationUrl);
        dto.setQrCodeData(verificationUrl);

        String html = renderHtmlDocument(dto);
        dto.setRenderedHtml(html);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public String generatePrintableHtml(Long requestId) {
        DocumentPreviewDTO dto = generateDocumentPreview(requestId);
        return dto.getRenderedHtml();
    }

    private String renderHtmlDocument(DocumentPreviewDTO dto) {
        String dayWithSuffix = getDayWithSuffix(dto.getIssueDate().getDayOfMonth());
        String monthName = dto.getIssueDate().format(DateTimeFormatter.ofPattern("MMMM"));
        int year = dto.getIssueDate().getYear();

        String bodyContent = generateDocumentBodyContent(dto);

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\" />\n" +
                "  <title>" + escapeHtml(dto.getServiceName()) + " - " + escapeHtml(dto.getRecipientName()) + "</title>\n" +
                "  <style>\n" +
                "    @page { size: A4; margin: 15mm 20mm; }\n" +
                "    body {\n" +
                "      font-family: 'Times New Roman', Times, serif;\n" +
                "      color: #1a1a1a;\n" +
                "      margin: 0;\n" +
                "      padding: 20px;\n" +
                "      line-height: 1.6;\n" +
                "      background-color: #ffffff;\n" +
                "    }\n" +
                "    .cert-border {\n" +
                "      border: 3px double #1e3a8a;\n" +
                "      padding: 30px;\n" +
                "      min-height: 900px;\n" +
                "      position: relative;\n" +
                "    }\n" +
                "    .header {\n" +
                "      text-align: center;\n" +
                "      border-bottom: 2px solid #1e3a8a;\n" +
                "      padding-bottom: 15px;\n" +
                "      margin-bottom: 25px;\n" +
                "    }\n" +
                "    .header h4 {\n" +
                "      margin: 2px 0;\n" +
                "      font-size: 13px;\n" +
                "      font-weight: normal;\n" +
                "      letter-spacing: 1px;\n" +
                "      text-transform: uppercase;\n" +
                "    }\n" +
                "    .header h3 {\n" +
                "      margin: 4px 0;\n" +
                "      font-size: 16px;\n" +
                "      font-weight: bold;\n" +
                "      color: #1e3a8a;\n" +
                "    }\n" +
                "    .header h2 {\n" +
                "      margin: 6px 0 0 0;\n" +
                "      font-size: 18px;\n" +
                "      color: #0f172a;\n" +
                "      font-weight: bold;\n" +
                "    }\n" +
                "    .title-banner {\n" +
                "      text-align: center;\n" +
                "      margin: 30px 0 25px 0;\n" +
                "    }\n" +
                "    .title-banner h1 {\n" +
                "      font-size: 26px;\n" +
                "      text-transform: uppercase;\n" +
                "      color: #1e3a8a;\n" +
                "      letter-spacing: 2px;\n" +
                "      margin: 0;\n" +
                "      text-decoration: underline;\n" +
                "    }\n" +
                "    .control-numbers {\n" +
                "      display: flex;\n" +
                "      justify-content: space-between;\n" +
                "      font-size: 12px;\n" +
                "      color: #4b5563;\n" +
                "      margin-bottom: 20px;\n" +
                "      border-bottom: 1px dashed #cbd5e1;\n" +
                "      padding-bottom: 6px;\n" +
                "    }\n" +
                "    .body-text {\n" +
                "      font-size: 15px;\n" +
                "      text-align: justify;\n" +
                "      text-indent: 40px;\n" +
                "      margin-bottom: 20px;\n" +
                "    }\n" +
                "    .salutation {\n" +
                "      font-size: 15px;\n" +
                "      font-weight: bold;\n" +
                "      margin: 25px 0 15px 0;\n" +
                "    }\n" +
                "    .closing-text {\n" +
                "      font-size: 15px;\n" +
                "      text-align: justify;\n" +
                "      text-indent: 40px;\n" +
                "      margin-top: 25px;\n" +
                "    }\n" +
                "    .signature-section {\n" +
                "      margin-top: 60px;\n" +
                "      display: flex;\n" +
                "      justify-content: space-between;\n" +
                "      align-items: flex-end;\n" +
                "    }\n" +
                "    .thumbmark-box {\n" +
                "      border: 1px solid #94a3b8;\n" +
                "      width: 110px;\n" +
                "      height: 90px;\n" +
                "      display: flex;\n" +
                "      align-items: center;\n" +
                "      justify-content: center;\n" +
                "      text-align: center;\n" +
                "      font-size: 10px;\n" +
                "      color: #64748b;\n" +
                "    }\n" +
                "    .signatory {\n" +
                "      text-align: center;\n" +
                "      width: 250px;\n" +
                "    }\n" +
                "    .signatory-name {\n" +
                "      font-weight: bold;\n" +
                "      font-size: 16px;\n" +
                "      text-transform: uppercase;\n" +
                "      border-bottom: 1px solid #1a1a1a;\n" +
                "      padding-bottom: 2px;\n" +
                "    }\n" +
                "    .signatory-title {\n" +
                "      font-size: 13px;\n" +
                "      margin-top: 4px;\n" +
                "      color: #334155;\n" +
                "    }\n" +
                "    .footer-audit {\n" +
                "      margin-top: 45px;\n" +
                "      padding-top: 15px;\n" +
                "      border-top: 1px solid #e2e8f0;\n" +
                "      display: flex;\n" +
                "      justify-content: space-between;\n" +
                "      font-size: 11px;\n" +
                "      color: #64748b;\n" +
                "    }\n" +
                "    .official-seal {\n" +
                "      position: absolute;\n" +
                "      bottom: 120px;\n" +
                "      left: 60px;\n" +
                "      width: 100px;\n" +
                "      height: 100px;\n" +
                "      border: 2px dashed #cbd5e1;\n" +
                "      border-radius: 50%;\n" +
                "      display: flex;\n" +
                "      align-items: center;\n" +
                "      justify-content: center;\n" +
                "      font-size: 10px;\n" +
                "      color: #94a3b8;\n" +
                "      text-transform: uppercase;\n" +
                "    }\n" +
                "    @media print {\n" +
                "      body { padding: 0; background: none; }\n" +
                "      .no-print { display: none; }\n" +
                "      .cert-border { min-height: 98vh; }\n" +
                "    }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"no-print\" style=\"text-align: right; margin-bottom: 15px;\">\n" +
                "    <button onclick=\"window.print()\" style=\"padding: 8px 16px; background-color: #1e3a8a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;\">🖨️ Print Certificate</button>\n" +
                "  </div>\n" +
                "  <div class=\"cert-border\">\n" +
                "    <div class=\"header\">\n" +
                "      <h4>Republic of the Philippines</h4>\n" +
                "      <h4>Province of Cebu • City of Talisay</h4>\n" +
                "      <h3>BARANGAY CANSOJONG</h3>\n" +
                "      <h2>OFFICE OF THE PUNONG BARANGAY</h2>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"control-numbers\">\n" +
                "      <div><strong>DOC CONTROL NO:</strong> " + escapeHtml(dto.getIssuedDocumentNumber()) + "</div>\n" +
                "      <div><strong>APP REF:</strong> " + escapeHtml(dto.getReferenceNumber()) + "</div>\n" +
                "      <div><strong>O.R. NO:</strong> " + escapeHtml(dto.getOfficialReceiptNumber()) + "</div>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"title-banner\">\n" +
                "      <h1>" + escapeHtml(dto.getServiceName()) + "</h1>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"salutation\">TO WHOM IT MAY CONCERN:</div>\n" +
                "\n" +
                bodyContent +
                "\n" +
                "    <div class=\"closing-text\">\n" +
                "      Issued this <strong>" + dayWithSuffix + " day of " + monthName + ", " + year + "</strong> at Barangay Cansojong, Talisay City, Cebu, Philippines upon request of the interested party for whatever legal purpose it may serve.\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"official-seal\">\n" +
                "      [ OFFICIAL SEAL ]\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"signature-section\">\n" +
                "      <div>\n" +
                "        <div class=\"thumbmark-box\">\n" +
                "          RIGHT THUMB<br/>MARK\n" +
                "        </div>\n" +
                "        <div style=\"font-size: 11px; margin-top: 5px; text-align: center;\">\n" +
                "          Signature of Applicant\n" +
                "        </div>\n" +
                "      </div>\n" +
                "\n" +
                "      <div class=\"signatory\">\n" +
                "        <div class=\"signatory-name\">" + escapeHtml(dto.getOfficialApproverName()) + "</div>\n" +
                "        <div class=\"signatory-title\">" + escapeHtml(dto.getOfficialApproverTitle()) + "</div>\n" +
                "        <div style=\"font-size: 11px; color: #64748b; margin-top: 4px;\">Barangay Cansojong, Talisay City</div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"footer-audit\">\n" +
                "      <div>Fee Paid: PHP " + String.format("%.2f", dto.getPaymentAmount()) + " | Valid Until: " + DateUtil.formatDate(dto.getValidUntil()) + "</div>\n" +
                "      <div>Verify online: " + escapeHtml(dto.getVerificationUrl()) + "</div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <script>\n" +
                "    if (new URLSearchParams(window.location.search).get('autoprint') === 'true') {\n" +
                "      window.addEventListener('load', function() {\n" +
                "        setTimeout(function() { window.print(); }, 350);\n" +
                "      });\n" +
                "    }\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }

    private String generateDocumentBodyContent(DocumentPreviewDTO dto) {
        String name = "<strong>" + escapeHtml(dto.getRecipientName().toUpperCase()) + "</strong>";
        String address = "<strong>" + escapeHtml(dto.getAddress()) + "</strong>";
        String purpose = "<strong>" + escapeHtml(dto.getPurpose()) + "</strong>";
        String code = dto.getServiceCode() != null ? dto.getServiceCode() : "";

        switch (code) {
            case "BC-CLEARANCE":
                return "<div class=\"body-text\">\n" +
                        "  This is to certify that " + name + ", of legal age, Filipino, and a bona fide resident of " + address + ", is personally known to me to be a person of good moral character, law-abiding citizen, and has <strong>NO DEROGATORY RECORD</strong> or pending criminal/civil case filed against him/her in this Barangay as of this date.\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  This certification and clearance is hereby issued upon the request of the above-named person for the purpose of: " + purpose + ".\n" +
                        "</div>";

            case "BC-RESIDENCY":
                return "<div class=\"body-text\">\n" +
                        "  This is to certify that " + name + ", of legal age, Filipino citizen, is a bonafide and permanent resident of " + address + " and has been residing in this Barangay up to the present date.\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  Based on the records of this office, the subject individual has maintained continuous residency and is of good moral standing in our community.\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  This certification is issued upon the request of the interested party for: " + purpose + ".\n" +
                        "</div>";

            case "BC-INDIGENCY":
                return "<div class=\"body-text\">\n" +
                        "  This is to certify that " + name + ", residing at " + address + ", belongs to an indigent family whose gross family income falls below the recognized poverty threshold as verified by our Barangay Social Welfare records.\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  This certification of indigency is granted free of charge pursuant to existing government policies, specifically for the purpose of availing: " + purpose + " (e.g. Medical / Financial / Educational / Legal Assistance).\n" +
                        "</div>";

            case "BC-BUSINESS":
                return "<div class=\"body-text\">\n" +
                        "  This is to certify that business clearance is hereby granted to " + name + " for operating a business located at " + address + ", having complied with the initial zoning, sanity, and regulatory ordinances of Barangay Cansojong, Talisay City, Cebu.\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  This clearance is valid subject to compliance with the National Building Code, Fire Safety requirements, City Permits, and licensing laws. Specific Line / Nature of Business: " + purpose + ".\n" +
                        "</div>";

            case "BC-FIRSTJOB":
                return "<div class=\"body-text\">\n" +
                        "  This is to certify that " + name + ", residing at " + address + ", is a certified <strong>FIRST TIME JOBSEEKER</strong> qualified to avail the benefits, privileges, and statutory fee exemptions provided under <strong>Republic Act No. 11261</strong> (First Time Jobseekers Assistance Act).\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  The applicant has executed the required Oath of Undertaking and is availing of this certification free of government fees and charges for the purpose of: " + purpose + ".\n" +
                        "</div>";

            default:
                return "<div class=\"body-text\">\n" +
                        "  This is to certify that " + name + ", residing at " + address + ", has applied for and completed the verification requirements for " + escapeHtml(dto.getServiceName()) + " at Barangay Cansojong, Talisay City, Cebu.\n" +
                        "</div>\n" +
                        "<div class=\"body-text\">\n" +
                        "  This document is issued for the purpose of: " + purpose + ".\n" +
                        "</div>";
        }
    }

    private String getDayWithSuffix(int day) {
        if (day >= 11 && day <= 13) {
            return day + "th";
        }
        switch (day % 10) {
            case 1:  return day + "st";
            case 2:  return day + "nd";
            case 3:  return day + "rd";
            default: return day + "th";
        }
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
