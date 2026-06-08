import { ArrowLeft, LogOut, User } from 'lucide-react';
import { formatCurrency } from '../data/menuData.js';

const userData = {
  nome: 'João Silva',
  telefone: '(11) 98765-4321',
  email: 'joao@email.com',
  cpf: '123.456.789-00',
  endereco: {
    rua: 'Av. Principal, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    cep: '01310-100'
  },
  pedidos: [
    { id: '#PED-2024-101', data: '15 Jun 2024', status: 'Entregue', total: 89.7, itens: 3 },
    { id: '#PED-2024-102', data: '08 Jun 2024', status: 'Em entrega', total: 156.8, itens: 5 },
    { id: '#PED-2024-103', data: '01 Jun 2024', status: 'Entregue', total: 120.5, itens: 4 }
  ]
};

function countOrderItems(order) {
  if (!Array.isArray(order?.items)) {
    return order?.itens ?? 0;
  }

  return order.items.reduce((total, item) => total + Number(item.quantity ?? 0), 0);
}

function formatOrderDate(order) {
  const date = order?.data ?? order?.createdAt;

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatOrderStatus(status) {
  const labels = {
    PENDING: 'Pendente',
    PREPARING: 'Preparando',
    READY: 'Pronto',
    OUT_FOR_DELIVERY: 'Em entrega',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
  };

  return labels[status] ?? status;
}

function getAccountData(customer) {
  if (!customer) {
    return userData;
  }

  return {
    nome: customer.name ?? userData.nome,
    telefone: customer.phone ?? 'Não informado',
    email: customer.email ?? userData.email,
    cpf: customer.cpf ?? 'Não informado',
    endereco: {
      rua: customer.street ?? 'Não informado',
      bairro: customer.neighborhood ?? 'Não informado',
      cidade: customer.city ?? 'Não informado',
      cep: customer.cep ?? 'Não informado',
    },
    pedidos: Array.isArray(customer.orders) ? customer.orders : userData.pedidos,
  };
}

export default function AccountPage({ isLoggedIn, onLoginClick, onLogout, customer }) {
  if (!isLoggedIn) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <a
          href="#/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 font-bold text-orange-700 transition hover:bg-orange-100"
        >
          <ArrowLeft size={18} />
          Voltar ao início
        </a>

        <section className="rounded-xl border-2 border-orange-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <User size={36} />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Minha Conta</h1>
          <p className="mb-6 text-slate-600">Entre para ver seus dados e seus pedidos.</p>
          <button
            onClick={onLoginClick}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-bold text-white transition hover:shadow-lg"
            type="button"
          >
            Fazer login
          </button>
        </section>
      </main>
    );
  }

  const accountData = getAccountData(customer);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <a
        href="#/"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 font-bold text-orange-700 transition hover:bg-orange-100"
      >
        <ArrowLeft size={18} />
        Voltar ao início
      </a>

      <section className="mb-8 rounded-xl border-2 border-orange-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{accountData.nome}</h1>
            <p className="text-slate-600">{accountData.email}</p>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border-2 border-orange-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-orange-600">Dados Pessoais</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-600">Nome</p>
            <p className="text-lg font-semibold text-slate-900">{accountData.nome}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Telefone</p>
            <p className="text-lg font-semibold text-slate-900">{accountData.telefone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Email</p>
            <p className="text-lg font-semibold text-slate-900">{accountData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">CPF</p>
            <p className="text-lg font-semibold text-slate-900">{accountData.cpf}</p>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border-2 border-orange-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-orange-600">Endereço</h2>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
          <p className="font-semibold text-slate-900">{accountData.endereco.rua}</p>
          <p className="text-slate-700">
            {accountData.endereco.bairro}, {accountData.endereco.cidade}
          </p>
          <p className="text-slate-600">CEP: {accountData.endereco.cep}</p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border-2 border-orange-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-orange-600">Meus Pedidos</h2>
        <div className="space-y-3">
          {accountData.pedidos.length === 0 && (
            <p className="rounded-lg bg-orange-50 p-4 text-slate-600">
              Você ainda não fez pedidos.
            </p>
          )}

          {accountData.pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{pedido.id}</p>
                  <p className="text-sm text-slate-600">{formatOrderDate(pedido)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    pedido.status === 'Entregue' || pedido.status === 'DELIVERED'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {formatOrderStatus(pedido.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{countOrderItems(pedido)} itens</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(pedido.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 py-3 text-lg font-bold text-white transition hover:shadow-lg"
        type="button"
      >
        <LogOut size={20} />
        Sair da Conta
      </button>
    </main>
  );
}
