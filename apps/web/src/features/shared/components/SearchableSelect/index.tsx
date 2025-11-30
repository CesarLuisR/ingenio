import { useState, useRef, useEffect } from "react";
import styled from "styled-components";

// --- STYLED COMPONENTS ---
const Wrapper = styled.div`
  position: relative;
  width: 200px; /* O el ancho que prefieras */
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: white;
  color: #0f172a;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-height: 250px;
  overflow-y: auto;
  z-index: 50;
`;

const Option = styled.li<{ $active?: boolean }>`
  padding: 8px 12px;
  font-size: 14px;
  color: ${props => props.$active ? '#2563eb' : '#334155'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: #f1f5f9;
  }
`;

const EmptyState = styled.li`
  padding: 12px;
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
`;

// --- INTERFACES ---
interface OptionType {
  id: number | string;
  name: string;
  code?: string; // Opcional, por si quieres mostrarlo
}

interface SearchableSelectProps {
  options: OptionType[];
  value?: number | string;
  onChange: (value: number) => void; // Asumimos ID numérico por tu DB
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Seleccionar...",
  disabled 
}: SearchableSelectProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Encontrar el objeto seleccionado actual para mostrar su nombre
  const selectedOption = options.find(op => op.id === value);

  // Efecto para cerrar el dropdown si clicamos fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrado local
  const filteredOptions = options.filter(op => 
    op.name.toLowerCase().includes(search.toLowerCase()) ||
    (op.code && op.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Wrapper ref={wrapperRef}>
      <Input
        type="text"
        placeholder={selectedOption ? selectedOption.name : placeholder}
        value={isOpen ? search : (selectedOption?.name || "")}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSearch(""); // Limpiar búsqueda al enfocar para ver todo
        }}
        disabled={disabled}
      />

      {isOpen && (
        <Dropdown>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((op) => (
              <Option
                key={op.id}
                $active={op.id === value}
                onClick={() => {
                  onChange(Number(op.id));
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {op.name} {op.code && <span style={{color: '#94a3b8', fontSize: 12}}>({op.code})</span>}
              </Option>
            ))
          ) : (
            <EmptyState>No se encontraron resultados</EmptyState>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
}