export default function RequesterDashboard() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-serif font-medium text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Overview of your ongoing applications and reports.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Active Projects</div>
                    <div className="text-4xl font-serif text-slate-900">3</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Funds Raised</div>
                    <div className="text-4xl font-serif text-slate-900">$1.2M</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Pending Actions</div>
                    <div className="text-4xl font-serif text-indigo-600">2</div>
                </div>
            </div>

            {/* Empty State / CTA */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
                <h3 className="text-xl font-medium text-indigo-900 mb-2">Start a New Application</h3>
                <p className="text-indigo-700 max-w-md mx-auto mb-6">Ready to submit a new funding request? Use our streamlined wizard to build a compelling case.</p>
                <a href="/requester/projects/new" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                    Create Project
                </a>
            </div>
        </div>
    );
}
