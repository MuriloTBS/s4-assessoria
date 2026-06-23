import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const UPDATED = '22 de junho de 2026'
const CONTACT = 'contato@s4assessoria.com.br'
const COMPANY = 'S4 Assessoria | Gestão e Tecnologia'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#e2e8f0] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#8a9bb0] hover:text-white transition-colors mb-8">
          <ArrowLeft size={15} /> Voltar ao login
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">Política de Privacidade</h1>
        <p className="text-sm text-[#8a9bb0] mb-8">Última atualização: {UPDATED}</p>

        <div className="space-y-7 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Quem somos</h2>
            <p>
              {COMPANY} (&quot;S4&quot;, &quot;nós&quot;) é responsável pelo tratamento dos dados pessoais
              coletados na plataforma de gestão de projetos disponível em{' '}
              <span className="text-blue-400">s4assessoria.com.br</span>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. Dados que coletamos</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#c8d6e5]">
              <li><strong className="text-white">Cadastro:</strong> nome, e-mail e senha (armazenada com hash Argon2 + pepper).</li>
              <li><strong className="text-white">Uso da plataforma:</strong> projetos, clientes, etapas, valores e prazos que você mesmo cadastra.</li>
              <li><strong className="text-white">Logs técnicos:</strong> erros de aplicação capturados via Sentry para fins de estabilidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. Finalidade e base legal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-[#8a9bb0] uppercase tracking-wide">
                    <th className="text-left py-2 pr-4">Finalidade</th>
                    <th className="text-left py-2">Base legal (LGPD, art. 7º)</th>
                  </tr>
                </thead>
                <tbody className="text-[#c8d6e5]">
                  {[
                    ['Autenticar e manter sua conta', 'Execução de contrato (inciso V)'],
                    ['Enviar e-mails de redefinição de senha', 'Execução de contrato (inciso V)'],
                    ['Exibir seus projetos e clientes', 'Execução de contrato (inciso V)'],
                    ['Monitorar erros e estabilidade', 'Legítimo interesse (inciso IX)'],
                    ['Notificações de prazo por WhatsApp', 'Consentimento (inciso I)'],
                  ].map(([fin, base]) => (
                    <tr key={fin} className="border-t border-[#2a3f5f]">
                      <td className="py-2 pr-4">{fin}</td>
                      <td className="py-2">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Compartilhamento de dados</h2>
            <p className="text-[#c8d6e5] mb-2">Seus dados são processados pelos seguintes suboperadores:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#c8d6e5]">
              <li><strong className="text-white">Oracle Cloud (Brasil):</strong> banco de dados onde projetos e clientes são armazenados.</li>
              <li><strong className="text-white">Vercel:</strong> hospedagem da aplicação e funções de backend.</li>
              <li><strong className="text-white">Resend:</strong> envio de e-mails transacionais (ex.: redefinição de senha).</li>
              <li><strong className="text-white">Sentry:</strong> captura de erros técnicos (dados anonimizados quando possível).</li>
            </ul>
            <p className="text-[#8a9bb0] mt-2">Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Retenção de dados</h2>
            <p className="text-[#c8d6e5]">
              Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, os dados
              são removidos em até 30 dias, salvo obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Seus direitos (LGPD, art. 18)</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#c8d6e5]">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar, corrigir ou atualizar seus dados.</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Solicitar a portabilidade dos dados.</li>
            </ul>
            <p className="text-[#8a9bb0] mt-2">
              Para exercer seus direitos, envie um e-mail para{' '}
              <a href={`mailto:${CONTACT}`} className="text-blue-400 hover:text-blue-300">{CONTACT}</a>.
              Respondemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Segurança</h2>
            <p className="text-[#c8d6e5]">
              Aplicamos criptografia Argon2 + pepper para senhas, HTTPS em todas as comunicações,
              headers de segurança HTTP (HSTS, CSP, X-Frame-Options) e chaves internas para acesso à API.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Contato</h2>
            <p className="text-[#c8d6e5]">
              Encarregado de Dados (DPO): <a href={`mailto:${CONTACT}`} className="text-blue-400 hover:text-blue-300">{CONTACT}</a>
            </p>
          </section>

          <div className="border-t border-[#2a3f5f] pt-6 text-xs text-[#8a9bb0]">
            Esta política pode ser atualizada periodicamente. Em caso de mudanças relevantes, notificaremos
            por e-mail ou aviso na plataforma.
          </div>
        </div>
      </div>
    </div>
  )
}
