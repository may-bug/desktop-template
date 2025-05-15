package cn.tecgui.desktop.server.model.data;

import lombok.Data;
import java.util.Map;

@Data
public class SignalMessage {
    private String type;  // join, leave, offer, answer, candidate, call-request, accept, reject, call-ended
    private String sender;
    private String receiver;
    private Map<String, Object> data;
    private Long timestamp;
}
