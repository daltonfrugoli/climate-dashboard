import api from './api';
import { User } from '@/types';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  role?: string;
}

export const usersService = {
  // Listar todos os usuários
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  // Buscar um usuário por ID
  async getById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Criar novo usuário
  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Atualizar usuário
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Deletar usuário
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};