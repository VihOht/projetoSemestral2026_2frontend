import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'


createRoot(document.getElementById('root')).render(
  <Auth0Provider
      domain="dev-bpbgrel3zl2chj7s.us.auth0.com"
      clientId="lWFWbWJEMrJjJ6CXI4SWQGhYb1iYT7Wa"
      authorizationParams={{
        audience: "https://dev-bpbgrel3zl2chj7s.us.auth0.com/api/v2/",
        redirect_uri: window.location.origin
      }}
    >
    <App />
  </Auth0Provider>,
)