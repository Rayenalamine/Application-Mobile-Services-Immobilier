package com.darlink;

import com.darlink.dto.auth.AuthResponse;
import com.darlink.dto.auth.LoginRequest;
import com.darlink.dto.auth.RegisterRequest;
import com.darlink.dto.auth.UpdateProfileRequest;
import com.darlink.dto.auth.UserResponse;
import com.darlink.dto.contact.ContactRequestDto;
import com.darlink.dto.contact.CreateContactRequest;
import com.darlink.dto.property.CreatePropertyRequest;
import com.darlink.dto.property.PageResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.dto.property.UpdatePropertyRequest;
import com.darlink.exception.ForbiddenException;
import com.darlink.service.AuthService;
import com.darlink.service.ContactRequestService;
import com.darlink.service.FavoriteService;
import com.darlink.service.PropertyService;
import com.darlink.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class FullWorkflowBackendTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private ContactRequestService contactRequestService;

    private static Long userAId;
    private static Long userBId;
    private static Long propertyId;

    @Test
    @Order(1)
    @DisplayName("1. Inscription et Connexion de l'Utilisateur A (Propriétaire)")
    void testUserARegistrationAndLogin() {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Mohamed Ben Ali");
        registerReq.setEmail("mohamed@darlink.tn");
        registerReq.setPassword("P@ssword2026!");
        registerReq.setPhone("+216 98 111 222");

        AuthResponse authRes = authService.register(registerReq);
        assertNotNull(authRes.getToken());
        assertNotNull(authRes.getUser());
        userAId = authRes.getUser().getId();
        assertEquals("Mohamed Ben Ali", authRes.getUser().getFullName());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("mohamed@darlink.tn");
        loginReq.setPassword("P@ssword2026!");

        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.getToken());
        assertEquals(userAId, loginRes.getUser().getId());
    }

    @Test
    @Order(2)
    @DisplayName("2. Inscription de l'Utilisateur B (Acheteur)")
    void testUserBRegistration() {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Amira Trabelsi");
        registerReq.setEmail("amira@darlink.tn");
        registerReq.setPassword("SecretKey123!");
        registerReq.setPhone("+216 22 333 444");

        AuthResponse authRes = authService.register(registerReq);
        assertNotNull(authRes.getToken());
        userBId = authRes.getUser().getId();
        assertNotEquals(userAId, userBId);
    }

    @Test
    @Order(3)
    @DisplayName("3. Rejet de l'inscription avec un email déjà existant")
    void testDuplicateEmailRejection() {
        RegisterRequest dupReq = new RegisterRequest();
        dupReq.setFullName("Imposteur");
        dupReq.setEmail("mohamed@darlink.tn");
        dupReq.setPassword("AnotherPass!");

        assertThrows(IllegalArgumentException.class, () -> authService.register(dupReq));
    }

    @Test
    @Order(4)
    @DisplayName("4. Création d'un bien immobilier par l'Utilisateur A")
    void testCreatePropertyByUserA() {
        CreatePropertyRequest req = new CreatePropertyRequest();
        req.setTitle("Penthouse Vue Mer Gammarth");
        req.setDescription("Sublime penthouse avec terrasse panoramique et jacuzzi sur le toit.");
        req.setLocation("Zone Touritique, Gammarth");
        req.setCity("Tunis");
        req.setPrice(new BigDecimal("950000.00"));
        req.setType("Appartement");
        req.setImageUrl("https://images.unsplash.com/photo-penthouse");
        req.setBedrooms(4);
        req.setBathrooms(3);
        req.setSurfaceM2(new BigDecimal("280.00"));
        req.setIsRental(false);

        PropertyDto created = propertyService.createProperty(req, userAId);
        assertNotNull(created.getId());
        propertyId = created.getId();
        assertEquals(userAId, created.getOwnerId());
        assertEquals("Penthouse Vue Mer Gammarth", created.getTitle());
    }

    @Test
    @Order(5)
    @DisplayName("5. Recherche et filtrage multi-critères sur PostgreSQL / H2")
    void testSearchAndFilterProperties() {
        // Filtrage par ville "Tunis" et type "Appartement"
        PageResponse<PropertyDto> page = propertyService.getProperties(
                0, 10, "Tunis", "Appartement", false,
                new BigDecimal("500000.00"), new BigDecimal("1000000.00"),
                3, "Penthouse", "price_asc"
        );

        assertNotNull(page);
        assertTrue(page.getTotalElements() >= 1);
        assertEquals("Penthouse Vue Mer Gammarth", page.getContent().get(0).getTitle());
    }

    @Test
    @Order(6)
    @DisplayName("6. Tentative de modification non autorisée par l'Utilisateur B (Rejet 403 Forbidden)")
    void testUnauthorizedPropertyUpdate() {
        UpdatePropertyRequest updateReq = new UpdatePropertyRequest();
        updateReq.setTitle("Titre Piraté");
        updateReq.setDescription("Tentative de hack");
        updateReq.setLocation("Gammarth");
        updateReq.setCity("Tunis");
        updateReq.setPrice(new BigDecimal("10.00"));
        updateReq.setType("Appartement");

        assertThrows(ForbiddenException.class, () ->
                propertyService.updateProperty(propertyId, updateReq, userBId)
        );
    }

    @Test
    @Order(7)
    @DisplayName("7. Modification autorisée par le propriétaire légitime (Utilisateur A)")
    void testAuthorizedPropertyUpdate() {
        UpdatePropertyRequest updateReq = new UpdatePropertyRequest();
        updateReq.setTitle("Penthouse Vue Mer Gammarth - Rénové");
        updateReq.setDescription("Sublime penthouse rénové avec vue à 360°.");
        updateReq.setLocation("Zone Touristique, Gammarth");
        updateReq.setCity("Tunis");
        updateReq.setPrice(new BigDecimal("980000.00"));
        updateReq.setType("Appartement");
        updateReq.setBedrooms(4);
        updateReq.setBathrooms(3);
        updateReq.setSurfaceM2(new BigDecimal("290.00"));

        PropertyDto updated = propertyService.updateProperty(propertyId, updateReq, userAId);
        assertEquals("Penthouse Vue Mer Gammarth - Rénové", updated.getTitle());
        assertEquals(new BigDecimal("980000.00"), updated.getPrice());
    }

    @Test
    @Order(8)
    @DisplayName("8. Gestion des favoris par l'Utilisateur B (Ajout, persistance, suppression)")
    void testFavoritesManagement() {
        // Ajout aux favoris
        favoriteService.addFavorite(userBId, propertyId);

        List<PropertyDto> favs = favoriteService.getUserFavorites(userBId);
        assertEquals(1, favs.size());
        assertEquals(propertyId, favs.get(0).getId());

        List<Long> ids = favoriteService.getUserFavoriteIds(userBId);
        assertTrue(ids.contains(propertyId));

        // Retrait des favoris
        favoriteService.removeFavorite(userBId, propertyId);
        List<PropertyDto> favsAfter = favoriteService.getUserFavorites(userBId);
        assertTrue(favsAfter.isEmpty());
    }

    @Test
    @Order(9)
    @DisplayName("9. Demande de contact de l'Utilisateur B vers le bien de l'Utilisateur A")
    void testContactRequestWorkflow() {
        CreateContactRequest contactReq = new CreateContactRequest();
        contactReq.setPropertyId(propertyId);
        contactReq.setSenderName("Amira Trabelsi");
        contactReq.setSenderEmail("amira@darlink.tn");
        contactReq.setSenderPhone("+216 22 333 444");
        contactReq.setMessage("Bonjour, je souhaite visiter ce penthouse ce samedi.");

        ContactRequestDto created = contactRequestService.createContactRequest(contactReq, userBId);
        assertNotNull(created.getId());
        assertEquals("PENDING", created.getStatus());

        // L'acheteur B vérifie ses demandes envoyées
        List<ContactRequestDto> sent = contactRequestService.getSentContactRequests(userBId);
        assertEquals(1, sent.size());

        // Le propriétaire A vérifie ses demandes reçues pour ses biens
        List<ContactRequestDto> received = contactRequestService.getReceivedContactRequests(userAId);
        assertEquals(1, received.size());
        assertEquals("Amira Trabelsi", received.get(0).getSenderName());

        // Le propriétaire A accepte la demande
        ContactRequestDto updated = contactRequestService.updateStatus(created.getId(), "ACCEPTED", userAId);
        assertEquals("ACCEPTED", updated.getStatus());
    }

    @Test
    @Order(10)
    @DisplayName("10. Mise à jour du profil utilisateur via UserService")
    void testUpdateUserProfile() {
        UpdateProfileRequest updateProfileReq = new UpdateProfileRequest();
        updateProfileReq.setFullName("Mohamed Ben Ali (Docteur)");
        updateProfileReq.setPhone("+216 99 888 777");

        UserResponse updatedProfile = userService.updateProfile(userAId, updateProfileReq);
        assertEquals("Mohamed Ben Ali (Docteur)", updatedProfile.getFullName());
        assertEquals("+216 99 888 777", updatedProfile.getPhone());
    }

    @Test
    @Order(11)
    @DisplayName("11. Suppression sécurisée du bien immobilier par son propriétaire (Utilisateur A)")
    void testDeletePropertyByOwner() {
        // Tentative par B -> Rejet
        assertThrows(ForbiddenException.class, () ->
                propertyService.deleteProperty(propertyId, userBId)
        );

        // Suppression par A -> Succès
        propertyService.deleteProperty(propertyId, userAId);

        // Vérification qu'il n'existe plus
        List<PropertyDto> userAProps = propertyService.getUserProperties(userAId);
        assertTrue(userAProps.stream().noneMatch(p -> p.getId().equals(propertyId)));
    }

    @Autowired
    private com.darlink.service.MessageService messageService;

    @Autowired
    private com.darlink.service.NotificationService notificationService;

    @Autowired
    private com.darlink.repository.UserRepository userRepository;

    @Test
    @Order(12)
    @DisplayName("12. Modification sécurisée du mot de passe utilisateur (V4)")
    void testChangeUserPassword() {
        // Tentative avec mauvais mot de passe actuel -> Exception
        assertThrows(ForbiddenException.class, () ->
                userService.changePassword(userBId, "MauvaisMotDePasse", "NouveauSuperP@ss2026!")
        );

        // Succès avec bon mot de passe
        userService.changePassword(userBId, "SecretKey123!", "NouveauSuperP@ss2026!");

        // Connexion avec le nouveau mot de passe
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("amira@darlink.tn");
        loginReq.setPassword("NouveauSuperP@ss2026!");
        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.getToken());
    }

    @Test
    @Order(13)
    @DisplayName("13. Envoi de message instantané et notification automatique (V9)")
    void testMessagingAndNotification() {
        com.darlink.dto.message.SendMessageRequest msgReq = new com.darlink.dto.message.SendMessageRequest();
        msgReq.setReceiverId(userAId);
        msgReq.setContent("Bonjour Mohamed, je suis intéressée par vos biens à Tunis.");

        com.darlink.dto.message.MessageDto msg = messageService.sendMessage(userBId, msgReq);
        assertNotNull(msg.getId());
        assertEquals("Bonjour Mohamed, je suis intéressée par vos biens à Tunis.", msg.getContent());

        // L'utilisateur A consulte sa conversation
        List<com.darlink.dto.message.MessageDto> conv = messageService.getConversation(userAId, userBId);
        assertFalse(conv.isEmpty());

        // L'utilisateur A a reçu une notification automatique
        List<com.darlink.dto.notification.NotificationDto> notifs = notificationService.getUserNotifications(userAId);
        assertTrue(notifs.stream().anyMatch(n -> "MESSAGE".equals(n.getType())));

        // Marquer la conversation comme lue
        messageService.markConversationAsRead(userAId, userBId);
        assertEquals(0, messageService.getUnreadMessagesCount(userAId));
    }

    @Test
    @Order(14)
    @DisplayName("14. Gestion des notifications in-app et alertes (V10)")
    void testNotificationManagement() {
        notificationService.createNotification(userBId, "Alerte Baisse de Prix", "Une villa a baissé de 10%", "PRICE_DROP", 2L);
        long unread = notificationService.getUnreadCount(userBId);
        assertTrue(unread > 0);

        notificationService.markAllAsRead(userBId);
        assertEquals(0, notificationService.getUnreadCount(userBId));
    }

    @Test
    @Order(15)
    @DisplayName("15. Rôle Administrateur et modération de la plateforme (V11)")
    void testAdminRoleAndModeration() {
        // Promouvoir l'utilisateur A en ADMIN
        com.darlink.entity.UserEntity userA = userRepository.findById(userAId).orElseThrow();
        userA.setRole("ADMIN");
        userRepository.save(userA);

        com.darlink.entity.UserEntity refreshed = userRepository.findById(userAId).orElseThrow();
        assertEquals("ADMIN", refreshed.getRole());
    }
}
