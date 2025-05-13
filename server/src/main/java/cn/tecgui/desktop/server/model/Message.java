package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// Message.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message implements Serializable {
    private String type;
    private String from;
    private String to;
}

