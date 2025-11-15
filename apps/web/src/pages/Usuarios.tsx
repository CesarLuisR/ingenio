"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { api } from "../lib/api"
import type { User } from "../types/index"

/* ------------------ Estilos ------------------ */

const Container = styled.div`
  padding: 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin: 0;
`

const Button = styled.button`
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TableHead = styled.thead`
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`

const TableHeader = styled.th`
  padding: 12px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #e5e7eb;

    &:hover {
      background-color: #f9fafb;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`

const TableCell = styled.td`
  padding: 16px 24px;
  white-space: nowrap;
  color: #6b7280;
  font-size: 14px;
`

const UserName = styled.div`
  font-weight: 500;
  color: #111827;
`

const RoleBadge = styled.span<{ role: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.role === "admin" ? "#f3e8ff" : props.role === "technician" ? "#dbeafe" : "#f3f4f6"};
  color: ${(props) => (props.role === "admin" ? "#6b21a8" : props.role === "technician" ? "#1e40af" : "#374151")};
`

const LoadingText = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
`

/* ------------------ Modal ------------------ */

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 460px;
  width: 100%;
  padding: 28px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #111827;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 12px;
`

const CancelButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #f3f4f6;
  }
`

const SubmitButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #1d4ed8;
  }
`

/* ------------------ Componente principal ------------------ */

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingText>Cargando usuarios...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>Gestión de Usuarios</Title>
        <Button onClick={() => setShowForm(true)}>+ Nuevo Usuario</Button>
      </Header>

      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Nombre</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Rol</TableHeader>
              <TableHeader>Ingenio</TableHeader>
              <TableHeader>Fecha Creación</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <tr key={user.id}>
                <TableCell><UserName>{user.name}</UserName></TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role}>
                    {user.role === "admin" ? "Administrador" : user.role === "technician" ? "Técnico" : "Visualizador"}
                  </RoleBadge>
                </TableCell>
                {/* <TableCell>{user.ingenioId}</TableCell> */}
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showForm && (
        <UserForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            loadUsers()
            setShowForm(false)
          }}
        />
      )}
    </Container>
  )
}

/* ------------------ Formulario de creación ------------------ */

function UserForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  // const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer" as "admin" | "technician" | "viewer",
    password: "",
    ingenioId: 2,
  })

  useEffect(() => {
    // loadIngenios()
  }, [])

  // const loadIngenios = async () => {
  //   try {
  //     const data = await api.getIngenios()
  //     setIngenios(data)
  //     if (data.length > 0) {
  //       setFormData((prev) => ({ ...prev, ingenioId: data[0].id }))
  //     }
  //   } catch (err) {
  //     console.error("Error cargando ingenios:", err)
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await api.createUser(formData)
      onSave()
    } catch (error) {
      console.error("Error creando usuario:", error)
    }
  }

  return (
    <Modal>
      <ModalContent>
        <ModalTitle>Nuevo Usuario</ModalTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nombre</Label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Rol</Label>
            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}>
              <option value="viewer">Visualizador</option>
              <option value="technician">Técnico</option>
              <option value="admin">Administrador</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Contraseña</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Ingenio</Label>
            <Select
              value={formData.ingenioId}
              onChange={(e) => setFormData({ ...formData, ingenioId: Number(e.target.value) })}
            >
              {/* {ingenios.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))} */}
            </Select>
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>Cancelar</CancelButton>
            <SubmitButton type="submit">Crear Usuario</SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  )
}
