package cn.tecgui.desktop.server.utils;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis操作类
 */
@Slf4j
@SuppressWarnings(value = { "unchecked", "rawtypes" })
@Component
public class RedisUtil {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    public RedisUtil(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void set(String key, Object value, long time) {
        log.info("redis set key:{} value:{} time:{}", key, value, time);
        redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
    }

    
    public void set(String key, Object value) {
        log.info("redis set key:{} value:{}", key, value);
        redisTemplate.opsForValue().set(key, value);
    }

    
    public Object get(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        log.info("redis get key:{} value:{}", key,value);
        return value;
    }

    
    public Boolean del(String key) {
        log.info("redis del key:{}", key);
        return redisTemplate.delete(key);
    }

    
    public Long del(List<String> keys) {
        log.info("redis del keys:{}", keys);
        return redisTemplate.delete(keys);
    }

    
    public Boolean expire(String key, long time) {
        log.info("redis exit expire key:{} time:{}", key, time);
        return redisTemplate.expire(key, time, TimeUnit.SECONDS);
    }

    
    public Long getExpire(String key) {
        log.info("redis get expire key:{}", key);
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    
    public Boolean hasKey(String key) {
        log.info("redis has key:{}", key);
        return redisTemplate.hasKey(key);
    }

    
    public Long incr(String key, long delta) {
        log.info("redis incr key:{} delta:{}", key, delta);
        return redisTemplate.opsForValue().increment(key, delta);
    }

    
    public Long decr(String key, long delta) {
        log.info("redis decr key:{} delta:{}", key, delta);
        return redisTemplate.opsForValue().increment(key, -delta);
    }

    
    public Object hGet(String key, String hashKey) {
        log.info("redis hGet key:{} hashKey:{}", key, hashKey);
        return redisTemplate.opsForHash().get(key, hashKey);
    }

    
    public Boolean hSet(String key, String hashKey, Object value, long time) {
        redisTemplate.opsForHash().put(key, hashKey, value);
        return expire(key, time);
    }

    
    public void hSet(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(key, hashKey, value);
    }

    
    public Map<Object, Object> hGetAll(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    
    public Boolean hSetAll(String key, Map<String, Object> map, long time) {
        redisTemplate.opsForHash().putAll(key, map);
        return expire(key, time);
    }

    
    public void hSetAll(String key, Map<String, ?> map) {
        redisTemplate.opsForHash().putAll(key, map);
    }

    
    public void hDel(String key, Object... hashKey) {
        redisTemplate.opsForHash().delete(key, hashKey);
    }

    
    public Boolean hHasKey(String key, String hashKey) {
        return redisTemplate.opsForHash().hasKey(key, hashKey);
    }

    
    public Long hIncr(String key, String hashKey, Long delta) {
        return redisTemplate.opsForHash().increment(key, hashKey, delta);
    }

    
    public Long hDecr(String key, String hashKey, Long delta) {
        return redisTemplate.opsForHash().increment(key, hashKey, -delta);
    }

    
    public Set<Object> sMembers(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    
    public Long sAdd(String key, Object... values) {
        return redisTemplate.opsForSet().add(key, values);
    }

    
    public Long sAdd(String key, long time, Object... values) {
        Long count = redisTemplate.opsForSet().add(key, values);
        expire(key, time);
        return count;
    }

    
    public Boolean sIsMember(String key, Object value) {
        return redisTemplate.opsForSet().isMember(key, value);
    }

    
    public Long sSize(String key) {
        return redisTemplate.opsForSet().size(key);
    }

    
    public Long sRemove(String key, Object... values) {
        return redisTemplate.opsForSet().remove(key, values);
    }

    
    public List<Object> lRange(String key, long start, long end) {
        return redisTemplate.opsForList().range(key, start, end);
    }

    
    public Long lSize(String key) {
        return redisTemplate.opsForList().size(key);
    }

    
    public Object lIndex(String key, long index) {
        return redisTemplate.opsForList().index(key, index);
    }

    
    public Long lPush(String key, Object value) {
        return redisTemplate.opsForList().rightPush(key, value);
    }

    
    public Long lPush(String key, Object value, long time) {
        Long index = redisTemplate.opsForList().rightPush(key, value);
        expire(key, time);
        return index;
    }

    
    public Long lPushAll(String key, Object... values) {
        return redisTemplate.opsForList().rightPushAll(key, values);
    }

    
    public Long lPushAll(String key, Long time, Object... values) {
        Long count = redisTemplate.opsForList().rightPushAll(key, values);
        expire(key, time);
        return count;
    }

    
    public Long lRemove(String key, long count, Object value) {
        return redisTemplate.opsForList().remove(key, count, value);
    }

    
    public void set(String key, Object value, long expire, TimeUnit timeUnit) {
        log.info("redis set key:{} value:{} expire:{} timeUnit:{}", key, value, expire ,timeUnit);
        redisTemplate.opsForValue().set(key, value, expire, TimeUnit.SECONDS);
    }
}
