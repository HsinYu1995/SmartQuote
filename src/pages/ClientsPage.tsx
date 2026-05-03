import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useClients } from '../hooks/useQuotes'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function ClientsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useClients(search)

  return (
    <div className="space-y-6" data-testid="clients-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link to="/quotes/new">
          <Button>+ New Quote</Button>
        </Link>
      </div>

      <Card>
        <Input
          placeholder="Search clients by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="client-search"
        />
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse h-14 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-1">No clients found</p>
            <p className="text-sm">Create a quote to add a client record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="clients-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Client', 'Contact', 'Location', 'Quotes', 'Latest Quote', ''].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-xs text-gray-500">DOB {client.dateOfBirth}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{client.email}</p>
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {client.city}, {client.state} {client.zipCode}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.quoteCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {client.latestQuoteAt ? format(new Date(client.latestQuoteAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/quotes?clientId=${client.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Quotes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
