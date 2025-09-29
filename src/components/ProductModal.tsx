import React, { useState, useEffect } from 'react';
import { X, Package, FileText, Tag, Plus, Trash2, Search, DollarSign, Calculator } from 'lucide-react';
import { useApp, Product, ProductComponent } from '../contexts/AppContext';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct, products, getAvailableComponents, calculateProductCost } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: 'material_bruto' as 'material_bruto' | 'parte_produto' | 'produto_pronto',
    unit: 'UN',
    cost_price: '',
    sale_price: '',
    current_stock: '',
    min_stock: '',
    supplier: ''
  });
  const [components, setComponents] = useState<ProductComponent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showComponentSearch, setShowComponentSearch] = useState(false);

  const units = ['UN', 'M', 'M²', 'M³', 'KG', 'L', 'PC'];
  const categories = ['Painéis', 'Ferragens', 'Madeiras', 'Vernizes', 'Colas', 'Parafusos', 'Portas', 'Gavetas', 'Prateleiras', 'Estruturas', 'Acessórios', 'Outros'];
  const productTypes = [
    { value: 'material_bruto', label: 'Material Bruto' },
    { value: 'parte_produto', label: 'Parte de Produto' },
    { value: 'produto_pronto', label: 'Produto Pronto' }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        type: product.type,
        unit: product.unit,
        cost_price: product.cost_price.toString(),
        sale_price: product.sale_price?.toString() || '',
        current_stock: product.current_stock.toString(),
        min_stock: product.min_stock.toString(),
        supplier: product.supplier || ''
      });
      setComponents(product.components);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular custo total dos componentes
    const componentsCost = components.reduce((sum, comp) => sum + comp.total_cost, 0);
    const finalCostPrice = formData.type === 'material_bruto' 
      ? parseFloat(formData.cost_price) || 0
      : componentsCost;
    
    const productData = {
      ...formData,
      cost_price: finalCostPrice,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : undefined,
      current_stock: parseFloat(formData.current_stock) || 0,
      min_stock: parseFloat(formData.min_stock) || 0,
      components
    };
    
    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addComponent = (productId: string, productName: string) => {
    const existingComponent = components.find(c => c.product_id === productId);
    const componentProduct = products.find(p => p.id === productId);
    
    if (!componentProduct) return;
    
    const unitCost = calculateProductCost(productId);
    
    if (existingComponent) {
      setComponents(prev => prev.map(c => 
        c.product_id === productId 
          ? { 
              ...c, 
              quantity: c.quantity + 1,
              total_cost: (c.quantity + 1) * unitCost
            }
          : c
      ));
    } else {
      setComponents(prev => [...prev, {
        product_id: productId,
        product_name: productName,
        quantity: 1,
        unit: componentProduct.unit,
        unit_cost: unitCost,
        total_cost: unitCost
      }]);
    }
    
    setShowComponentSearch(false);
    setSearchTerm('');
  };

  const updateComponentQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeComponent(productId);
      return;
    }
    
    setComponents(prev => prev.map(c => 
      c.product_id === productId 
        ? { 
            ...c, 
            quantity,
            total_cost: quantity * c.unit_cost
          }
        : c
    ));
  };

  const removeComponent = (productId: string) => {
    setComponents(prev => prev.filter(c => c.product_id !== productId));
  };

  const availableComponents = getAvailableComponents().filter(p => p.id !== product?.id);
  const filteredComponents = availableComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalComponentsCost = components.reduce((sum, comp) => sum + comp.total_cost, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-2 text-amber-600" />
                Nome do Produto
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: Porta de Armário 40x60cm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2 text-amber-600" />
                Tipo de Produto
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {formData.type === 'material_bruto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nome do fornecedor"
                />
              </div>
            )}
          </div>

          {/* Custos e Preços */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2 text-green-600" />
                {formData.type === 'material_bruto' ? 'Custo de Aquisição (R$)' : 'Custo Calculado (R$)'}
              </label>
              <input
                type="number"
                name="cost_price"
                value={formData.type === 'material_bruto' ? formData.cost_price : totalComponentsCost.toFixed(2)}
                onChange={handleChange}
                required={formData.type === 'material_bruto'}
                disabled={formData.type !== 'material_bruto'}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Atual
              </label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2 text-amber-600" />
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Descreva o produto..."
              />
            </div>

          </div>

          {/* Componentes */}
          {formData.type !== 'material_bruto' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-amber-600" />
                Componentes do Produto
              </h3>
              <button
                type="button"
                onClick={() => setShowComponentSearch(true)}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Componente</span>
              </button>
            </div>

            {/* Lista de Componentes */}
            <div className="space-y-3">
              {components.map((component) => (
                <div key={component.product_id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{component.product_name}</h4>
                    <p className="text-sm text-gray-600">Unidade: {component.unit}</p>
                    <p className="text-sm text-green-600">Custo unit.: R$ {component.unit_cost.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Qtd:</label>
                      <input
                        type="number"
                        value={component.quantity}
                        onChange={(e) => updateComponentQuantity(component.product_id, parseFloat(e.target.value))}
                        min="0.01"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      R$ {component.total_cost.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeComponent(component.product_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {components.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-800">Custo Total dos Componentes:</span>
                  <span className="font-bold text-green-800">R$ {totalComponentsCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            {components.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum componente adicionado</p>
                <p className="text-sm">Clique em "Adicionar Componente" para começar</p>
              </div>
            )}
          </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {product ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Busca de Componentes */}
      {showComponentSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Selecionar Componente</h3>
                <button
                  onClick={() => {
                    setShowComponentSearch(false);
                    setSearchTerm('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar componentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredComponents.map((component) => (
                  <button
                    key={component.id}
                    type="button"
                    onClick={() => addComponent(component.id, component.name)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{component.name}</h4>
                        <p className="text-sm text-gray-600">{component.description}</p>
                        <p className="text-xs text-gray-500">
                          {component.type === 'material_bruto' ? 'Material Bruto' : 'Parte de Produto'} | 
                          Categoria: {component.category} | Unidade: {component.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          Estoque: {component.current_stock} {component.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Custo: R$ {calculateProductCost(component.id).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {filteredComponents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum componente encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;