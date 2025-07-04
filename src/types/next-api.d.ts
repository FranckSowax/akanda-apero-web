// Définition de type pour les handlers de route Next.js 15.x
import { NextRequest } from 'next/server';

export interface RouteHandlerContext<P extends Record<string, string> = Record<string, string>> {
  params: P;
}

// Type explicite pour les handlers de route avec un paramètre id
export interface IdRouteContext extends RouteHandlerContext {
  params: {
    id: string;
  };
}
