package cn.tecgui.desktop.server.config;

import cn.tecgui.desktop.server.components.RateLimiter;
import cn.tecgui.desktop.server.components.SensitiveWordFilter;
import cn.tecgui.desktop.server.handler.DataSocketHandler;
import cn.tecgui.desktop.server.interceptor.AuthHandshakeInterceptor;
import cn.tecgui.desktop.server.service.DataService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final DataService dataService;

    public WebSocketConfig(DataService dataService) {
        this.dataService = dataService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new DataSocketHandler(dataService,new SensitiveWordFilter()), "/ws/video")
                .setAllowedOrigins("*")
                .addInterceptors(new AuthHandshakeInterceptor(),new HttpSessionHandshakeInterceptor());
    }
}