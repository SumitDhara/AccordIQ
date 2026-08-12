package com.accordiq.security.util;

import com.accordiq.user.entity.User;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    /**
     * Returns the currently authenticated user.
     *
     * @throws IllegalStateException when no authenticated user exists
     */
    public User getCurrentUser() {

        User user = getCurrentUserOrNull();

        if (user == null) {
            throw new IllegalStateException(
                    "Authenticated user is required."
            );
        }

        return user;
    }

    /**
     * Returns the currently authenticated user,
     * or null when the request is anonymous.
     *
     * This method is intentionally used only for operations
     * that support both anonymous and authenticated users.
     */
    public User getCurrentUserOrNull() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {

            return null;
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {
            return null;
        }

        return userDetails.getUser();
    }
}