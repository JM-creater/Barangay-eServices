import { useEffect, useState } from 'react'

export const useModalMobileAIButton = () => {
  const [modalMobile, setModalMobile] = useState<boolean>(false);

  useEffect(() => {
    if (modalMobile) {
      document.body.classList.add('mobile-menu-active');
    } else {
      document.body.classList.remove('mobile-menu-active');
    }

    return () => {
      document.body.classList.remove('mobile-menu-active');
    };
  }, [modalMobile]);

  return {
    modalMobile,
    setModalMobile
  }
}
