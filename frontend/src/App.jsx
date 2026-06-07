import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Accueil from './pages/public/Accueil';
import Fonctionnement from './pages/public/Fonctionnement';
import CartePublique from './pages/public/CartePublique';
import Connexion from './pages/public/Connexion';
import CitoyenDashboard from './pages/citoyen/CitoyenDashboard';
import Signaler from './pages/citoyen/Signaler';
import MesSignalements from './pages/citoyen/MesSignalements';
import AlertesLocalite from './pages/citoyen/AlertesLocalite';
import Historique from './pages/citoyen/Historique';
import CarteCitoyen from './pages/citoyen/CarteCitoyen';
import AlertesReelles from './pages/citoyen/AlertesReelles';
import AutoriteDashboard from './pages/autorite/AutoriteDashboard';
import SuiviSinistres from './pages/autorite/SuiviSinistres';
import GestionSignalements from './pages/autorite/GestionSignalements';
import EnvoiAlertes from './pages/autorite/EnvoiAlertes';
import GenerationRapports from './pages/autorite/GenerationRapports';
import Inscription from './pages/public/SignalerPublic'; // 🚨 Note : On utilise ton nouveau fichier d'inscription ici
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Navbar />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Accueil />} />
        <Route path="/fonctionnement" element={<Fonctionnement />} />
        <Route path="/carte" element={<CartePublique />} />
        <Route path="/connexion" element={<Connexion />} />
        
        {/* 🚨 URL ajustée pour correspondre à la création de compte pure */}
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/signaler" element={<Inscription />} /> {/* Sécurité si un vieux bouton pointe encore ici */}
        
        {/* Routes protégées citoyen */}
        <Route path="/citoyen/dashboard" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <CitoyenDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/citoyen/signaler" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <Signaler />
          </ProtectedRoute>
        } />
        
        <Route path="/citoyen/mes-signalements" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <MesSignalements />
          </ProtectedRoute>
        } />

        <Route path="/citoyen/alertes" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <AlertesLocalite />
          </ProtectedRoute>
        } />

        <Route path="/citoyen/historique" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <Historique />
          </ProtectedRoute>
        } />

        <Route path="/citoyen/carte" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <CarteCitoyen />
          </ProtectedRoute>
        } />

        <Route path="/citoyen/alertes-reelles" element={
          <ProtectedRoute allowedRoles={['CITOYEN']}>
            <AlertesReelles />
          </ProtectedRoute>
        } />

        {/* Routes protégées autorité */}
        <Route path="/autorite/dashboard" element={
          <ProtectedRoute allowedRoles={['AUTORITE']}>
            <AutoriteDashboard />
          </ProtectedRoute>
        } />

        <Route path="/autorite/sinistres" element={
          <ProtectedRoute allowedRoles={['AUTORITE']}>
            <SuiviSinistres />
          </ProtectedRoute>
        } />

        <Route path="/autorite/signalements" element={
          <ProtectedRoute allowedRoles={['AUTORITE']}>
            <GestionSignalements />
          </ProtectedRoute>
        } />

        <Route path="/autorite/alertes" element={
          <ProtectedRoute allowedRoles={['AUTORITE']}>
            <EnvoiAlertes />
          </ProtectedRoute>
        } />

        <Route path="/autorite/rapports" element={
          <ProtectedRoute allowedRoles={['AUTORITE']}>
            <GenerationRapports />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;