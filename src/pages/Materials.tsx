import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';

const Materials: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-amber-600 mb-4">
            <Package className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Materiais Integrados aos Produtos
          </h3>
          <p className="text-gray-600 mb-6">
            Os materiais agora fazem parte do sistema de produtos. Você pode gerenciar materiais brutos, 
            partes de produtos e produtos prontos na seção de Produtos.
          </p>
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <span className="font-medium">Ir para Produtos</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materials;