package at.fhtw.backend;

import at.fhtw.backend.model.Tour;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TourIsolationIntegrationTest {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    @Autowired
    TourIsolationIntegrationTest(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    @Test
    void usersShouldOnlySeeAndModifyOwnTours() throws Exception {
        String suffix = String.valueOf(System.nanoTime());
        String tokenUserA = registerAndGetToken("alice-" + suffix);
        String tokenUserB = registerAndGetToken("bob-" + suffix);

        Long userATourId = createTourAndReturnId(tokenUserA, "A tour " + suffix);

        mockMvc.perform(get("/api/tours")
                        .header("Authorization", "Bearer " + tokenUserB))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
                    if (!node.isArray() || !node.isEmpty()) {
                        throw new AssertionError("User B should not see tours from user A.");
                    }
                });

        mockMvc.perform(get("/api/tours/{id}", userATourId)
                        .header("Authorization", "Bearer " + tokenUserB))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/tours/{id}", userATourId)
                        .header("Authorization", "Bearer " + tokenUserB))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/tours/{id}", userATourId)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isOk());
    }

    private String registerAndGetToken(String username) throws Exception {
        String requestBody = "{" +
                "\"username\":\"" + username + "\"," +
                "\"password\":\"testpass123\"" +
                "}";

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("token").asText();
    }

    private Long createTourAndReturnId(String token, String name) throws Exception {
        Tour tour = new Tour();
        tour.setName(name);
        tour.setDescription("Desc");
        tour.setFromLocation("A");
        tour.setToLocation("B");
        tour.setTransportType("Walking");
        tour.setDistance(1.0);
        tour.setEstimatedTime(1.0);
        tour.setImageUrl("https://example.com/img.jpg");

        MvcResult result = mockMvc.perform(post("/api/tours")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tour)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }
}


