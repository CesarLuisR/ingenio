import { Link } from "react-router-dom";
import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`

export const Sidebar = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 256px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

export const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
`

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

export const Nav = styled.nav`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const NavLinkStyled = styled(Link)<{ $active: boolean }>`
  display: block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  background-color: ${(props) => (props.$active ? "#eff6ff" : "transparent")};
  color: ${(props) => (props.$active ? "#1d4ed8" : "#374151")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#eff6ff" : "#f3f4f6")};
  }
`

export const MainContent = styled.main`
  margin-left: 256px;
  padding: 2rem;
`