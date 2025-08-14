import React, { useState, useEffect } from 'react';
import { checkTaskApplicationsExists, getCleanupSQL } from '@/lib/cleanupDatabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const DatabaseCleanup = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTable = async () => {
    setLoading(true);
    try {
      const result = await checkTaskApplicationsExists();
      setStatus(result);
    } catch (error) {
      setStatus({ exists: 'error', error: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    checkTable();
  }, []);

  const copySQL = () => {
    navigator.clipboard.writeText(getCleanupSQL());
    alert('SQL copied to clipboard!');
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Database Cleanup Status</h2>
      
      <div className="space-y-4">
        <div>
          <Button onClick={checkTable} disabled={loading}>
            {loading ? 'Checking...' : 'Check task_applications Table'}
          </Button>
        </div>

        {status && (
          <div className="p-4 rounded border">
            <h3 className="font-semibold mb-2">Status:</h3>
            {status.exists === false && (
              <div className="text-green-600">
                ✅ Good! task_applications table does not exist.
              </div>
            )}
            {status.exists === true && (
              <div className="text-orange-600">
                ⚠️ task_applications table still exists and should be removed.
              </div>
            )}
            {status.exists === 'unknown' && (
              <div className="text-red-600">
                ❌ Error checking table: {status.error}
              </div>
            )}
            {status.exists === 'error' && (
              <div className="text-red-600">
                ❌ Error: {status.error}
              </div>
            )}
          </div>
        )}

        {status?.exists === true && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Manual Cleanup Required</h3>
              <p className="text-sm text-gray-600 mb-3">
                Go to Supabase Dashboard → SQL Editor and run this query:
              </p>
              <Button onClick={copySQL} variant="outline" size="sm">
                Copy SQL to Clipboard
              </Button>
            </div>
            
            <div className="p-4 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
              <pre>{getCleanupSQL()}</pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
