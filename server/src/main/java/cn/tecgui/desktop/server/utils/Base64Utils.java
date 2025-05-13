package cn.tecgui.desktop.server.utils;

import org.apache.tomcat.util.codec.binary.Base64;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

public class Base64Utils {

    public static String bufferedImageToBase64(BufferedImage bufferedImage){
        try{
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "png", stream);
            Base64 base = new Base64();
            byte[] bytes= base.encode(stream.toByteArray());
            String base64 = base.encodeAsString(bytes);
            return "data:image/png;base64," + base64;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
