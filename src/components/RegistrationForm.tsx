import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Building, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegistrationFormProps {
  userPhone: string;
  userRole: "client" | "wholesale" | "driver" | "admin";
  onSuccess: () => void;
}

export default function RegistrationForm({ userPhone, userRole, onSuccess }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    document: "",
    document_type: "cpf",
    date_of_birth: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    complement: "",
    address_number: "",
    customer_type: userRole === "wholesale" ? "wholesale" : "regular"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Create profile
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: userEmail,
          full_name: formData.full_name,
          phone: formData.phone,
          document: formData.document,
          document_type: formData.document_type,
          date_of_birth: formData.date_of_birth || null,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          complement: formData.complement,
          address_number: formData.address_number,
          role: userRole,
          customer_type: formData.customer_type,
          is_approved: userRole === "admin" ? true : false,
          is_blocked: false
        });

      if (error) throw error;

      onSuccess();
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao completar cadastro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-purple-800 to-black" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Complete seu Cadastro
            </motion.h1>
            <p className="text-white/80">
              Configure suas informações pessoais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-white">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type" className="text-white">Tipo de Documento</Label>
                  <Select value={formData.document_type} onValueChange={(value) => handleInputChange("document_type", value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="document" className="text-white">
                    {formData.document_type === "cpf" ? "CPF *" : "CNPJ *"}
                  </Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => handleInputChange("document", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder={formData.document_type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date_of_birth" className="text-white">Data de Nascimento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip_code" className="text-white">CEP</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange("zip_code", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-white">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Rua, Avenida, etc."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address_number" className="text-white">Número</Label>
                  <Input
                    id="address_number"
                    value={formData.address_number}
                    onChange={(e) => handleInputChange("address_number", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="complement" className="text-white">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleInputChange("complement", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Apto, Sala, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood" className="text-white">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-white">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-white">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="SP, RJ, MG, etc."
                  />
                </div>
              </div>
            </div>

            {/* Tipo específico para lojista */}
            {userRole === "wholesale" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações da Empresa
                </h3>

                <div>
                  <Label className="text-white">Tipo de Cliente</Label>
                  <Select value={formData.customer_type} onValueChange={(value) => handleInputChange("customer_type", value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Lojista/Revendedor</SelectItem>
                      <SelectItem value="regular">Cliente Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
            >
              {loading ? "Salvando..." : "Concluir Cadastro"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
