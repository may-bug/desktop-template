package cn.tecgui.desktop.server.service;

import cn.tecgui.desktop.server.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.stream.Collectors;

@Service
public class SignalingService {

    private static final Logger logger = LoggerFactory.getLogger(SignalingService.class);
    private final RoomService roomService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SignalingService(RoomService roomService) {
        this.roomService = roomService;
    }

    public void joinRoom(String roomId, String userId, WebSocketSession session) throws IOException {
        UserSession userSession = new UserSession(userId, session);
        Room room = roomService.joinRoom(roomId, userSession);

        // 通知新用户房间信息
        sendRoomInfo(room, userSession);

        // 通知其他用户有新用户加入
        notifyPeerJoined(room, userSession);
    }

    private void sendRoomInfo(Room room, UserSession userSession) throws IOException {
        RoomInfo roomInfo = new RoomInfo();
        roomInfo.setType("room-info");
        roomInfo.setRoomId(room.getId());
        roomInfo.setUsers(room.getUsers().stream()
                .filter(u -> !u.getUserId().equals(userSession.getUserId()))
                .map(UserInfo::new)
                .collect(Collectors.toList()));
        userSession.getSession().sendMessage(
                new TextMessage(objectMapper.writeValueAsString(roomInfo)));
    }

    private void notifyPeerJoined(Room room, UserSession newUser) throws IOException {
        Message joinMessage = new Message();
        joinMessage.setType("peer-joined");
        joinMessage.setFrom(newUser.getUserId());

        String message = objectMapper.writeValueAsString(joinMessage);

        room.getUsers().stream()
                .filter(u -> !u.getUserId().equals(newUser.getUserId()))
                .forEach(u -> {
                    try {
                        u.getSession().sendMessage(new TextMessage(message));
                    } catch (IOException e) {
                        logger.error("Error notifying peer joined: {}", e.getMessage());
                    }
                });
    }

    public void sendOffer(SdpMessage offerMsg) throws IOException {
        Room room = roomService.getRoom(offerMsg.getRoomId());
        UserSession targetUser = room.getUser(offerMsg.getTo());

        if (targetUser != null) {
            targetUser.getSession().sendMessage(
                    new TextMessage(objectMapper.writeValueAsString(offerMsg)));
        }
    }

    public void sendAnswer(SdpMessage answerMsg) throws IOException {
        Room room = roomService.getRoom(answerMsg.getRoomId());
        UserSession targetUser = room.getUser(answerMsg.getTo());

        if (targetUser != null) {
            targetUser.getSession().sendMessage(
                    new TextMessage(objectMapper.writeValueAsString(answerMsg)));
        }
    }

    public void sendIceCandidate(IceCandidateMessage iceMsg) throws IOException {
        Room room = roomService.getRoom(iceMsg.getRoomId());
        UserSession targetUser = room.getUser(iceMsg.getTo());

        if (targetUser != null) {
            targetUser.getSession().sendMessage(
                    new TextMessage(objectMapper.writeValueAsString(iceMsg)));
        }
    }

    public void leaveRoom(WebSocketSession session) {
        try {
            Room room = roomService.leaveRoom(session);
            if (room != null) {
                notifyPeerLeft(room, session);
            }
        } catch (Exception e) {
            logger.error("Error leaving room: {}", e.getMessage());
        }
    }

    private void notifyPeerLeft(Room room, WebSocketSession leftSession) {
        room.getUsers().forEach(u -> {
            try {
                if (!u.getSession().getId().equals(leftSession.getId())) {
                    Message leaveMessage = new Message();
                    leaveMessage.setType("peer-left");
                    leaveMessage.setFrom(room.getUserBySession(leftSession).getUserId());

                    u.getSession().sendMessage(
                            new TextMessage(objectMapper.writeValueAsString(leaveMessage)));
                }
            } catch (IOException e) {
                logger.error("Error notifying peer left: {}", e.getMessage());
            }
        });
    }
}
