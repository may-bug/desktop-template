package cn.tecgui.desktop.server.model.data;

import lombok.Data;

@Data
public class IceCandidateDTO {
    private String candidate;
    private String sdpMid;
    private Integer sdpMLineIndex;
}
