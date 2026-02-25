import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || '/auth', 
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'bananint',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'bananint-client',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
