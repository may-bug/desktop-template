package cn.tecgui.desktop.server.model.data;

import lombok.Data;

@Data
public class SessionDescriptionDTO {
    private String type; // offer, answer
    private String sdp;
}
