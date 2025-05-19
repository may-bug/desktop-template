package cn.tecgui.desktop.server.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import cn.tecgui.desktop.server.core.HttpResponse;
import cn.tecgui.desktop.server.model.LoginRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/account")
public class AccountController {

    @SaIgnore
    @PostMapping("/login")
    public HttpResponse<Object> login(@RequestBody LoginRequest request) {
        String account = request.getAccount();
        String password = request.getPassword();
        if (account == null || password == null) {
            return HttpResponse.fail("登录失败");
        }
        if (!account.equals("admin")){
            return HttpResponse.fail("账号不存在");
        }
        if(!password.equals("123456")){
            return HttpResponse.fail("密码错误");
        }
        SaLoginParameter parameter= new SaLoginParameter();
        parameter.setExtra("name","管理员");
        StpUtil.login(account,parameter);
        Map<String,String> result=new HashMap<>();
        result.put("token", StpUtil.getTokenValue());
        result.put("uid", request.getAccount());
        return HttpResponse.success("登录成功",result);
    }

    @GetMapping("/isLogin")
    public HttpResponse<Object> isLogin() {
        return HttpResponse.success("获取成功",StpUtil.isLogin());
    }

    @GetMapping("/logout")
    public HttpResponse<Object> logout() {
        StpUtil.logout();
        return HttpResponse.success("退出登录成功");
    }
}
