package cn.tecgui.desktop.server.components;

import cn.tecgui.desktop.server.service.DataService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;

import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class ConnectionHealthChecker {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final DataService dataService;

    // 30秒无活动视为不活跃
    private static final long INACTIVITY_THRESHOLD = 30_000;

    public ConnectionHealthChecker(DataService dataService) {
        this.dataService = dataService;
    }

    @PostConstruct
    public void init() {
        scheduler.scheduleAtFixedRate(this::checkInactiveConnections,
                60, 60, TimeUnit.SECONDS); // 每分钟检查一次
    }

    public void checkInactiveConnections() {
        long now = System.currentTimeMillis();
        dataService.getAllSessions().forEach(session -> {
            if (session.isOpen()) {
                Long lastActivity = (Long) session.getAttributes().get("lastActivity");
                if (lastActivity != null && now - lastActivity > INACTIVITY_THRESHOLD) {
                    try {
                        session.close(CloseStatus.SESSION_NOT_RELIABLE);
                        log.info("Closed inactive session: {}", session.getId());
                    } catch (IOException e) {
                        log.error("Error closing inactive session", e);
                    }
                }
            }
        });
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdown();
    }
}
