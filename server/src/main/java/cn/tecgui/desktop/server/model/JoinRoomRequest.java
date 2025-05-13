package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

// JoinRoomRequest.java
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRoomRequest extends Message {
    private String roomId;
    private String userId;
}
