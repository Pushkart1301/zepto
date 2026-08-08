import { createContext, useContext } from 'react';
import { PipelineTicket } from '../types/ticket';

export const TicketsContext = createContext<PipelineTicket[]>([]);
export const useTickets = () => useContext(TicketsContext);
