package cn.tecgui.desktop.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
public class WebSocketSecurityConfig {

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(65536);
        container.setMaxBinaryMessageBufferSize(65536);
        container.setMaxSessionIdleTimeout(600000L); // 10分钟
        return container;
    }
}