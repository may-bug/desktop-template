package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

// IceCandidateMessage.java
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IceCandidateMessage extends Message {
    private String roomId;
    private Object candidate;
}
