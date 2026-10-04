package com.barangay.eservices.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncMailConfig {

    private static final Logger logger = LoggerFactory.getLogger(AsyncMailConfig.class);

    @Autowired
    private MailProperties properties;

    @Value("${app.mail.async.core-pool-size}")
    private int corePoolSize;

    @Value("${app.mail.async.max-pool-size}")
    private int maxPoolSize;

    @Value("${app.mail.async.queue-capacity}")
    private int queueCapacity;

    @Bean(name = "mailTaskExecutor")
    public Executor mailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        int core = corePoolSize > 0 ? corePoolSize : (properties != null ? properties.getCorePoolSize() : 2);
        int max = maxPoolSize > 0 ? maxPoolSize : (properties != null ? properties.getMaxPoolSize() : 10);
        int queue = queueCapacity > 0 ? queueCapacity : (properties != null ? properties.getQueueCapacity() : 200);

        executor.setCorePoolSize(core);
        executor.setMaxPoolSize(max);
        executor.setQueueCapacity(queue);
        executor.setThreadNamePrefix("BrevoMailWorker-");
        executor.setRejectedExecutionHandler((r, exec) ->
                logger.warn("[MAIL QUEUE FULL] Email task discarded to prevent server overload"));
        executor.initialize();
        return executor;
    }
}
