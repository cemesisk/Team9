package at.fhtw.backend.service;

import at.fhtw.backend.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final List<User> users = new ArrayList<>();
    private Long nextUserId = 1L;

    public synchronized User createUser(String username, String passwordHash) {
        User user = new User(nextUserId++, username, passwordHash);
        users.add(user);
        return user;
    }

    public synchronized User findByUsername(String username) {
        return users.stream()
                .filter(user -> user.getUsername().equalsIgnoreCase(username))
                .findFirst()
                .orElse(null);
    }
}

