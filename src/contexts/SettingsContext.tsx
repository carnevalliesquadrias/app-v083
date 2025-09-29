import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PDFSettings {
  watermark: {
    enabled: boolean;
    opacity: number; // 0 a 1
    size: number; // tamanho em pixels
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  header: {
    companyName: {
      fontSize: number;
      fontWeight: 'normal' | 'bold';
      color: string; // hex color
    };
    backgroundColor: string; // hex color
    height: number; // altura do cabeçalho
  };
  company: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    cnpj: string;
    ie: string;
  };
}

interface SettingsContextType {
  pdfSettings: PDFSettings;
  updatePDFSettings: (settings: Partial<PDFSettings>) => void;
  resetPDFSettings: () => void;
}

const defaultPDFSettings: PDFSettings = {
  watermark: {
    enabled: true,
    opacity: 0.08,
    size: 80,
    position: 'center'
  },
  header: {
    companyName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF'
    },
    backgroundColor: '#4682B4',
    height: 35
  },
  company: {
    name: 'CARNEVALLI ESQUADRIAS LTDA',
    address: 'BUARQUE DE MACEDO, 2735 - PAVILHÃO - CENTRO',
    city: 'Nova Prata - RS - CEP: 95320-000',
    phone: '(54) 3242-2072',
    email: 'carnevalli.esquadrias@gmail.com',
    cnpj: '88.235.288/0001-24',
    ie: '0850011930'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>(defaultPDFSettings);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pdfSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setPdfSettings({ ...defaultPDFSettings, ...parsed });
      } catch (error) {
        console.error('Erro ao carregar configurações do PDF:', error);
      }
    }
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('pdfSettings', JSON.stringify(pdfSettings));
  }, [pdfSettings]);

  const updatePDFSettings = (newSettings: Partial<PDFSettings>) => {
    setPdfSettings(prev => ({
      ...prev,
      ...newSettings,
      watermark: { ...prev.watermark, ...newSettings.watermark },
      header: { 
        ...prev.header, 
        ...newSettings.header,
        companyName: { ...prev.header.companyName, ...newSettings.header?.companyName }
      },
      company: { ...prev.company, ...newSettings.company }
    }));
  };

  const resetPDFSettings = () => {
    setPdfSettings(defaultPDFSettings);
    localStorage.removeItem('pdfSettings');
  };

  return (
    <SettingsContext.Provider value={{
      pdfSettings,
      updatePDFSettings,
      resetPDFSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};