// 6. USER MANAGER (With Department Import)
export const AdminUserManager: React.FC = () => {
  const { users, addUser, updateUser, importUsers, lockUser, departments, companies } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User>({ id: '', username: '', fullName: '', email: '', role: UserRole.EMPLOYEE, companyId: '', departmentId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = async () => {
      if (editData.id) {
          await updateUser(editData);
      } else {
          await addUser({ ...editData, id: 'u_' + Date.now(), isLocked: false });
      }
      setIsEditing(false);
  };

  const openNew = () => {
      setEditData({ id: '', username: '', fullName: '', email: '', role: UserRole.EMPLOYEE, companyId: companies[0]?.id || '', departmentId: departments[0]?.id || '' });
      setIsEditing(true);
  };

  const openEdit = (u: User) => {
      setEditData(u);
      setIsEditing(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (!text) return;

          const lines = text.split('\n');
          const newUsers: User[] = [];
          
          // Skip header row if it looks like a header
          const startIdx = lines[0].toLowerCase().includes('username') ? 1 : 0;

          for (let i = startIdx; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              // SPLIT BY COMMA (Expected: username, name, role, email, deptName)
              const [username, fullName, role, email, deptName] = line.split(',').map(s => s.trim());
              
              if (username && fullName) {
                  // 1. Resolve Department Name to ID
                  let targetDeptId = departments[0]?.id; // Default
                  if (deptName) {
                      const foundDept = departments.find(d => d.name.toLowerCase() === deptName.toLowerCase());
                      if (foundDept) targetDeptId = foundDept.id;
                  }

                  newUsers.push({
                      id: 'imp_' + Date.now() + i,
                      username,
                      fullName,
                      role: (role as UserRole) || UserRole.EMPLOYEE,
                      email: email || '',
                      companyId: companies[0]?.id, 
                      departmentId: targetDeptId, // <--- Assigned here
                      isLocked: false
                  });
              }
          }

          if (newUsers.length > 0) {
              if (confirm(`Ready to import ${newUsers.length} users?`)) {
                  await importUsers(newUsers);
                  alert("Import successful!");
              }
          } else {
              alert("No valid user data found in CSV. \nExpected format: username, Full Name, role, email, Department");
          }
          
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  return (
      <div className="space-y-6 pb-20">
          <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div>
                  <h2 className="text-2xl font-bold text-white">User Directory</h2>
                  <p className="text-slate-400 text-sm">{users.length} registered users</p>
              </div>
              <div className="flex gap-3">
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".csv,.txt" 
                      onChange={handleFileUpload} 
                  />
                  <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold flex items-center border border-slate-600"
                  >
                      <Upload className="w-5 h-5 mr-2" /> Import CSV
                  </button>
                  <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center">
                      <UserPlus className="w-5 h-5 mr-2" /> Add User
                  </button>
              </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                  <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold">
                          <tr>
                              <th className="p-4">Name / Username</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">Dept / Company</th> {/* Updated Header */}
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {filteredUsers.map(user => {
                              const compName = companies.find(c => c.id === user.companyId)?.name || 'N/A';
                              const deptName = departments.find(d => d.id === user.departmentId)?.name || 'General';
                              return (
                                  <tr key={user.id} className="hover:bg-slate-700/50">
                                      <td className="p-4">
                                          <p className="font-bold text-white">{user.fullName}</p>
                                          <p className="text-sm text-slate-400">@{user.username}</p>
                                      </td>
                                      <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded text-xs text-white">{user.role}</span></td>
                                      <td className="p-4 text-slate-300 text-sm">
                                          <span className="block text-white font-medium">{deptName}</span>
                                          <span className="text-xs">{compName}</span>
                                      </td>
                                      <td className="p-4">
                                          {user.isLocked ? 
                                              <span className="text-red-400 text-xs font-bold flex items-center"><Lock className="w-3 h-3 mr-1" /> Locked</span> : 
                                              <span className="text-green-400 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>
                                          }
                                      </td>
                                      <td className="p-4 text-right flex justify-end gap-2">
                                          <button onClick={() => openEdit(user)} className="p-2 text-blue-400 hover:bg-slate-600 rounded"><Edit2 className="w-4 h-4" /></button>
                                          <button onClick={() => lockUser(user.id, !user.isLocked)} className={`p-2 rounded ${user.isLocked ? 'text-green-400 hover:bg-green-900/20' : 'text-red-400 hover:bg-red-900/20'}`}>
                                              {user.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* EDIT MODAL - UNCHANGED */}
          {isEditing && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-800 p-8 rounded-xl w-full max-w-lg border border-slate-700">
                      <h3 className="text-xl font-bold text-white mb-6">{editData.id ? 'Edit User' : 'Create User'}</h3>
                      <div className="space-y-4">
                          <div><label className="text-slate-400 text-xs uppercase font-bold">Full Name</label><input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1" value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} /></div>
                          <div><label className="text-slate-400 text-xs uppercase font-bold">Username</label><input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} /></div>
                          <div><label className="text-slate-400 text-xs uppercase font-bold">Role</label>
                              <select className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1" value={editData.role} onChange={e => setEditData({...editData, role: e.target.value as UserRole})}>
                                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                          </div>
                          {/* ADDED DEPT DROPDOWN TO EDIT MODAL */}
                          <div><label className="text-slate-400 text-xs uppercase font-bold">Department</label>
                              <select className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1" value={editData.departmentId} onChange={e => setEditData({...editData, departmentId: e.target.value})}>
                                  <option value="">-- Select Department --</option>
                                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                          </div>
                          <div><label className="text-slate-400 text-xs uppercase font-bold">Company</label>
                              <select className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1" value={editData.companyId} onChange={e => setEditData({...editData, companyId: e.target.value})}>
                                  <option value="">None</option>
                                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                          </div>
                      </div>
                      <div className="flex gap-3 mt-8">
                          <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-bold">Save User</button>
                          <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded font-bold">Cancel</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};
