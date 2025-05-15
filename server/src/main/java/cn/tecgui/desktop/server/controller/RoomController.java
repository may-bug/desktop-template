package cn.tecgui.desktop.server.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import cn.tecgui.desktop.server.core.HttpResponse;
import cn.tecgui.desktop.server.except.RoomNotFoundException;
import cn.tecgui.desktop.server.except.UnauthorizedAccessException;
import cn.tecgui.desktop.server.model.CreateRoomRequest;
import cn.tecgui.desktop.server.model.JoinRoomRequest;
import cn.tecgui.desktop.server.model.RoomDTO;
import cn.tecgui.desktop.server.service.RoomService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room")
@SaCheckLogin
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/list")
    public HttpResponse<List<RoomDTO>> getAllRooms() {
        return HttpResponse.success(roomService.getAllRooms());
    }

    @PostMapping("/create")
    public HttpResponse<RoomDTO> createRoom(@RequestBody CreateRoomRequest request) {
        String creatorId = StpUtil.getLoginIdAsString();
        return HttpResponse.success(roomService.convertToDTO(roomService.createRoom(request, creatorId)));
    }

    @PostMapping("/{roomId}/join")
    public HttpResponse<Void> joinRoom(
            @PathVariable String roomId,
            @RequestBody JoinRoomRequest request) throws RoomNotFoundException, UnauthorizedAccessException {
        String userId = StpUtil.getLoginIdAsString();
        roomService.joinRoom(roomId, request.getPassword(), userId);
        return HttpResponse.success("加入成功");
    }

    @PostMapping("/{roomId}/leave")
    public HttpResponse<Void> leaveRoom(@PathVariable String roomId) throws RoomNotFoundException {
        String userId = StpUtil.getLoginIdAsString();
        roomService.leaveRoom(roomId, userId);
        return HttpResponse.success("退出成功");
    }
}