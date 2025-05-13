package cn.tecgui.desktop.server.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.lang.Snowflake;
import cn.hutool.extra.qrcode.QrCodeUtil;
import cn.hutool.extra.qrcode.QrConfig;
import cn.tecgui.desktop.server.core.HttpResponse;
import cn.tecgui.desktop.server.utils.Base64Utils;
import cn.tecgui.desktop.server.utils.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/account/qr")
public class QRController {

    private final RedisUtil redisUtil;

    public QRController(RedisUtil redisUtil) {
        this.redisUtil = redisUtil;
    }

    public String getValue(String uid){
        return String.valueOf(redisUtil.get("user:qr:uid:"+uid));
    }

    public Long getExpire(String uid){
        return redisUtil.getExpire("user:qr:uid:"+uid);
    }
    /**
     * 生成uid
     */
    @GetMapping("/generateUid")
    private HttpResponse<Object> generateUid(){
        Snowflake snowflake = new Snowflake(1, 1);
        String uid = String.valueOf(snowflake.nextId());
        Map<String,Object> result = new HashMap<>();
        redisUtil.set("user:qr:uid:"+uid,"init",60 * 3);
        result.put("uid",uid);
        return HttpResponse.success("获取成功",result);
    }

    /**
     * 生成二维码
     */
    @GetMapping("/generateQr")
    public HttpResponse<Object> generateQR(@RequestParam("uid") String uid){
        QrConfig config = new QrConfig(200, 200);
        config.setMargin(1);
        BufferedImage qr=QrCodeUtil.generate(uid, config);
        String value= Base64Utils.bufferedImageToBase64(qr);
        String check=getValue(uid);
        if(check==null){
            return HttpResponse.fail("error");
        }
        redisUtil.set("user:qr:uid:"+uid,"qr",60* 3);
        Map<String,Object> result = new HashMap<>();
        result.put("image",value);
        return HttpResponse.success(result);
    }

    /**
     * 轮询二维码状态
     */
    @GetMapping("/polling")
    public HttpResponse<Object> polling(@RequestParam("uid") String uid){
        Map<String,Object> result = new HashMap<>();
        long expire =getExpire(uid);
        if(expire==-1){
            result.put("status", "expire");
            return HttpResponse.success(result);
        }
        String status=getValue(uid);
        if(status.equals("confirm")){
            result.put("token", StpUtil.getTokenValue());
            redisUtil.del("user:qr:uid:"+uid);
        }
        result.put("status", status);
        return HttpResponse.success(result);
    }

    /**
     * 扫描二维码(APP)
     */
    @GetMapping("/scan")
    public HttpResponse<Object> scanQR(@RequestParam("uid") String uid){
        String check =getValue(uid);
        if(check==null){
            return HttpResponse.fail("无效请求");
        }
        if(!check.equals("qr")){
            return HttpResponse.success("非法请求");
        }
        long expire =getExpire(uid);
        if(expire>0){
            redisUtil.set("user:qr:uid:"+uid,"scan",60 * 3 - expire);
        }
        return HttpResponse.success("扫描成功");
    }

    /**
     * 确认登录(APP)
     */
    @GetMapping("/confirm")
    public HttpResponse<Object> confirm(@RequestParam("uid") String uid){
        String check =getValue(uid);
        if(check==null){
            return HttpResponse.fail("非法请求");
        }
        if(!check.equals("scan")){
            return HttpResponse.success("无效请求");
        }
        long expire =getExpire(uid);
        if(expire>0){
            redisUtil.set("user:qr:uid:"+uid,"confirm",60 * 3 - expire);
        }
        return HttpResponse.success("确认登录");
    }

    /**
     * 取消登录(APP)
     */
    @GetMapping("/cancel")
    public HttpResponse<Object> canal(@RequestParam("uid") String uid){
        String check =getValue(uid);
        if(check==null){
            return HttpResponse.fail("非法请求");
        }
        if(!check.equals("scan")){
            return HttpResponse.success("无效请求");
        }
        long expire =getExpire(uid);
        if(expire>0){
            redisUtil.set("user:qr:uid:"+uid,"cancel",60 * 3 - expire);
        }
        return HttpResponse.success("取消登录");
    }
}

