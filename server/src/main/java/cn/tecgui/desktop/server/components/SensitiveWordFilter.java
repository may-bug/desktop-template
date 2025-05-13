package cn.tecgui.desktop.server.components;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class SensitiveWordFilter {
    private final Set<String> sensitiveWords = new HashSet<>(Arrays.asList(
            "敏感词1", "敏感词2", "badword"
    ));

    public String filter(String text) {
        if (text == null) return null;

        String filtered = text;
        for (String word : sensitiveWords) {
            filtered = filtered.replaceAll("(?i)" + Pattern.quote(word), "***");
        }
        return filtered;
    }
}
