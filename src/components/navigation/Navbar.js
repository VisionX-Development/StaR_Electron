import React, { useContext } from "react";
import NavItem from "./NavItem";
import NavLogo from "./NavLogo";
import styled from "styled-components";
import authContext from "../context/auth/authContext";
import ExpanderContext from "../context/expander/expanderContext";
import CardsContext from "../context/cards/cardsContext";

const NavMain = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: var(--theme-color);
  padding: 0.3rem 0.7rem 0.3rem 0.7rem;
  z-index: 1;
  position: sticky;
  top: 0;
  height: 5rem;

  // phone
  @media (max-width: 600px) {
  }
  // tablet portrait
  @media (max-width: 900px) {
  }
  // tablet landscape
  @media (max-width: 1200px) {
  }
  // desktop
  @media (max-width: 1800px) {
  }
  // >1800px = wide screen
`;

const NavLeft = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const NavRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(authContext);

  const { clearExpander } = useContext(ExpanderContext);

  const { clearCards, setCardsState } = useContext(CardsContext);

  const onLogout = () => {
    setCardsState("cardsUserData", null);
    clearCards();
    clearExpander();
    logout();
  };

  return (
    <NavMain id="NavMain">
      <NavLeft data-testid="NavbarComponent">
        <NavLogo navLink="/#Start" width="75%" />
        {isAuthenticated && (
          <>
            <NavItem head="Arbeitsplatz" navLink="/workplace" />
            <NavItem head="Einstellungen" navLink="/settings" />
          </>
        )}
        {isAuthenticated && user && user.role && (
          <NavItem head="Admin" navLink="/admin" />
        )}
      </NavLeft>
      <NavRight>
        {isAuthenticated ? (
          <>
            <NavItem
              style={{
                textDecoration: "none",
                textShadow: "none",
                cursor: "default",
              }}
              head={user && `Hallo ${user.first_name}`}
              navLink="#!"
            />
            <div onClick={onLogout}>
              <NavItem
                onClick={(e) => onLogout()}
                head="Ausloggen"
                navLink="/"
              />
            </div>
          </>
        ) : (
          <NavItem head="Login" navLink="/login" />
        )}
      </NavRight>
    </NavMain>
  );
};

export default Navbar;
