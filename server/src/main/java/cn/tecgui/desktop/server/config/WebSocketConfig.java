package cn.tecgui.desktop.server.config;

import cn.tecgui.desktop.server.components.RateLimiter;
import cn.tecgui.desktop.server.components.SensitiveWordFilter;
import cn.tecgui.desktop.server.handler.DataSocketHandler;
import cn.tecgui.desktop.server.handler.SignalingSocketHandler;
import cn.tecgui.desktop.server.interceptor.AuthHandshakeInterceptor;
import cn.tecgui.desktop.server.service.DataService;
import cn.tecgui.desktop.server.service.SignalingService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SignalingService signalingService;
    private final DataService dataService;

    public WebSocketConfig(SignalingService signalingService, DataService dataService) {
        this.signalingService = signalingService;
        this.dataService = dataService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SignalingSocketHandler(signalingService), "/ws/signaling")
                .addHandler(new DataSocketHandler(dataService,new RateLimiter(),new SensitiveWordFilter()), "/ws/data")
                .setAllowedOrigins("*")
                .addInterceptors(new AuthHandshakeInterceptor(),new HttpSessionHandshakeInterceptor());
    }
}