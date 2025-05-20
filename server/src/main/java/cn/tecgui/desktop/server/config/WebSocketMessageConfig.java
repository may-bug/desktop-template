package cn.tecgui.desktop.server.config;

import cn.tecgui.desktop.server.components.SaTokenManager;
import cn.tecgui.desktop.server.handler.UidHandshakeHandler;
import cn.tecgui.desktop.server.handler.UidHandshakeInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketMessageConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/notify").setAllowedOrigins("*")
                .addInterceptors(new UidHandshakeInterceptor(new SaTokenManager()))
                .setHandshakeHandler(new UidHandshakeHandler());
    }

    @Bean
    public ThreadPoolTaskScheduler brokerTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("broker-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(brokerTaskScheduler());
        registry.setApplicationDestinationPrefixes("/app"); // 接收注册指令
        registry.setUserDestinationPrefix("/user");
    }
}

