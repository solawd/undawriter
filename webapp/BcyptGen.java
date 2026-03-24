import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcyptGen {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("password123"));
    }
}
