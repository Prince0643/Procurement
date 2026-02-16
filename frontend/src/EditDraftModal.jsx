
      {/* Edit Draft Modal */}
      {showEditDraftModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Draft PR</h2>
              <p className="text-sm text-gray-500 mt-1">{pr.pr_number}</p>
            </div>
            <div className="p-6 space-y-4">
              {editDraftError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{editDraftError}</p>
                </div>
              )}
              {editDraftSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">Draft updated successfully!</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                <input
                  type="text"
                  value={editDraftFormData.purpose}
                  onChange={(e) => setEditDraftFormData({ ...editDraftFormData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Needed</label>
                  <input
                    type="date"
                    value={editDraftFormData.date_needed}
                    onChange={(e) => setEditDraftFormData({ ...editDraftFormData, date_needed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <input
                    type="text"
                    value={editDraftFormData.project}
                    onChange={(e) => setEditDraftFormData({ ...editDraftFormData, project: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                <input
                  type="text"
                  value={editDraftFormData.project_address}
                  onChange={(e) => setEditDraftFormData({ ...editDraftFormData, project_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={editDraftFormData.remarks}
                  onChange={(e) => setEditDraftFormData({ ...editDraftFormData, remarks: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Item</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Qty</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editDraftItems.map((item, index) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-2 px-3">{item.item_name || item.item_code}</td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...editDraftItems]
                                newItems[index].quantity = parseInt(e.target.value) || 1
                                setEditDraftItems(newItems)
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="py-2 px-3">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditDraftModal(false)}
                disabled={editDraftLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditDraft}
                disabled={editDraftLoading || !editDraftFormData.purpose}
              >
                {editDraftLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}
