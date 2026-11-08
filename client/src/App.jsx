
import { useState } from 'react'
import './App.css'

const API_URL = 'https://interdepartmental-resource-sharing.onrender.com/api'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)

  const [departments, setDepartments] = useState([])
  const [resources, setResources] = useState([])
  const [requests, setRequests] = useState([])

  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedResource, setSelectedResource] = useState('')
  const [purpose, setPurpose] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [requestMessage, setRequestMessage] = useState('')
  const [alternatives, setAlternatives] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Admin management forms
  const [showDepartmentForm, setShowDepartmentForm] = useState(false)
  const [showResourceForm, setShowResourceForm] = useState(false)

  const [departmentName, setDepartmentName] = useState('')
  const [departmentCode, setDepartmentCode] = useState('')
  const [departmentDescription, setDepartmentDescription] = useState('')

  const [resourceName, setResourceName] = useState('')
  const [resourceType, setResourceType] = useState('equipment')
  const [resourceDescription, setResourceDescription] = useState('')
  const [resourceDepartment, setResourceDepartment] = useState('')

  const [adminMessage, setAdminMessage] = useState('')
  const [isSavingAdminData, setIsSavingAdminData] = useState(false)

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/departments`)
      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        setDepartments(data)
      } else {
        console.error('Failed to fetch departments:', data.message)
        setDepartments([])
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      setDepartments([])
    }
  }

  // Fetch resources
  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_URL}/resources`)
      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        setResources(data)
      } else {
        console.error('Failed to fetch resources:', data.message)
        setResources([])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      setResources([])
    }
  }

  // Fetch resource requests
  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/resource-requests`)
      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        setRequests(data)
      } else {
        console.error('Failed to fetch resource requests:', data.message)
        setRequests([])
      }
    } catch (error) {
      console.error('Failed to fetch resource requests:', error)
      setRequests([])
    }
  }

  // Login
  const handleLogin = async (event) => {
    event.preventDefault()

    if (isLoggingIn) return

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    setIsLoggingIn(true)
    setMessage('Connecting to the server... Please wait.')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
        signal: controller.signal,
      })

      const responseText = await response.text()
      let data

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error('The server returned an invalid response.')
      }

      if (!response.ok) {
        setMessage(
          data.message ||
          data.error ||
          `Login failed. Server status: ${response.status}`
        )
        return
      }

      if (!data.token) {
        setMessage(
          'Login succeeded, but the server did not return a token.'
        )
        return
      }

      if (!data.user) {
        setMessage('The server did not return user details.')
        return
      }

      localStorage.setItem('token', data.token)
      setLoggedInUser(data.user)

      await Promise.all([
        fetchDepartments(),
        fetchResources(),
        fetchRequests(),
      ])

      setIsLoggedIn(true)
      setPassword('')
      setMessage('')
      setRequestMessage('')
      setAdminMessage('')

    } catch (error) {
      console.error('Login error:', error)

      if (error.name === 'AbortError') {
        setMessage(
          'The server is taking too long to respond. Please try again.'
        )
      } else {
        setMessage(
          error.message ||
          'Cannot connect to the server. Please try again.'
        )
      }
    } finally {
      clearTimeout(timeoutId)
      setIsLoggingIn(false)
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setLoggedInUser(null)
    setEmail('')
    setPassword('')
    setDepartments([])
    setResources([])
    setRequests([])
    setShowRequestForm(false)
    setShowDepartmentForm(false)
    setShowResourceForm(false)
    setRequestMessage('')
    setAdminMessage('')
    setAlternatives([])
    setMessage('')
  }

  // Find the department's MongoDB ID
  const getDepartmentId = () => {
    const userDepartment = loggedInUser?.department

    if (!userDepartment) return null

    const departmentId =
      typeof userDepartment === 'object'
        ? userDepartment._id
        : userDepartment

    const departmentCode =
      typeof userDepartment === 'object'
        ? userDepartment.code
        : userDepartment

    const department = departments.find(
      (item) =>
        item._id === departmentId ||
        item.code === departmentCode
    )

    return department?._id || null
  }

  // Find alternative resources
  const fetchAlternatives = async () => {
    if (!selectedResource || !startDate || !endDate) return

    try {
      const params = new URLSearchParams({
        resource: selectedResource,
        startDate,
        endDate,
      })

      const response = await fetch(
        `${API_URL}/resource-requests/alternatives?${params}`
      )

      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        setAlternatives(data)
      } else {
        setAlternatives([])
      }
    } catch (error) {
      console.error('Failed to fetch alternative resources:', error)
    }
  }

  // Submit a resource request
  const handleRequestSubmit = async (event) => {
    event.preventDefault()
    setRequestMessage('')
    setAlternatives([])

    const token = localStorage.getItem('token')
    const departmentId = getDepartmentId()

    if (!token) {
      setRequestMessage('Please sign in again to submit a request.')
      return
    }

    if (!departmentId) {
      setRequestMessage(
        'Could not identify your department. Please contact the administrator.'
      )
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setRequestMessage('The end date and time must be after the start.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/resource-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resource: selectedResource,
          requestedFrom: departmentId,
          startDate,
          endDate,
          purpose,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setRequestMessage(
          data.error
            ? `${data.message}: ${data.error}`
            : data.message || 'Failed to submit resource request.'
        )

        if (response.status === 409) {
          await fetchAlternatives()
        }

        return
      }

      setRequestMessage('Resource request submitted successfully!')
      setSelectedResource('')
      setPurpose('')
      setStartDate('')
      setEndDate('')
      setAlternatives([])
      setShowRequestForm(false)

      await fetchRequests()
    } catch (error) {
      console.error('Request submission error:', error)
      setRequestMessage('Cannot connect to the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Admin: Add a department
  const handleAddDepartment = async (event) => {
    event.preventDefault()
    setAdminMessage('')

    const token = localStorage.getItem('token')

    if (!token) {
      setAdminMessage('Please sign in again.')
      return
    }

    setIsSavingAdminData(true)

    try {
      const response = await fetch(`${API_URL}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: departmentName.trim(),
          code: departmentCode.trim().toUpperCase(),
          description: departmentDescription.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAdminMessage(data.message || 'Failed to add department.')
        return
      }

      setAdminMessage('Department added successfully!')
      setDepartmentName('')
      setDepartmentCode('')
      setDepartmentDescription('')
      setShowDepartmentForm(false)

      await fetchDepartments()
    } catch (error) {
      console.error('Add department error:', error)
      setAdminMessage('Could not connect to the server.')
    } finally {
      setIsSavingAdminData(false)
    }
  }

  // Admin: Add a resource
  const handleAddResource = async (event) => {
    event.preventDefault()
    setAdminMessage('')

    const token = localStorage.getItem('token')

    if (!token) {
      setAdminMessage('Please sign in again.')
      return
    }

    setIsSavingAdminData(true)

    try {
      const response = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: resourceName.trim(),
          type: resourceType,
          description: resourceDescription.trim(),
          department: resourceDepartment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAdminMessage(data.message || 'Failed to add resource.')
        return
      }

      setAdminMessage('Resource added successfully!')
      setResourceName('')
      setResourceType('equipment')
      setResourceDescription('')
      setResourceDepartment('')
      setShowResourceForm(false)

      await fetchResources()
    } catch (error) {
      console.error('Add resource error:', error)
      setAdminMessage('Could not connect to the server.')
    } finally {
      setIsSavingAdminData(false)
    }
  }

  // Admin: Approve or reject a pending request
  const handleRequestStatus = async (requestId, status) => {
    const token = localStorage.getItem('token')

    if (!token) {
      setRequestMessage('Please sign in again.')
      return
    }

    setRequestMessage('')

    try {
      const response = await fetch(
        `${API_URL}/resource-requests/${requestId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setRequestMessage(
          data.message || 'Failed to update request status.'
        )
        return
      }

      setRequestMessage(`Request ${status} successfully.`)
      await fetchRequests()
    } catch (error) {
      console.error('Update request status error:', error)
      setRequestMessage('Could not connect to the server.')
    }
  }

  return isLoggedIn ? (
    <main className="dashboard">
      <h1>Interdepartmental Resource Sharing Platform</h1>

      <p>Welcome, {loggedInUser?.name || 'User'}!</p>
      <p>Role: {loggedInUser?.role || 'User'}</p>

      <button type="button" onClick={handleLogout}>
        Logout
      </button>

      {/* Admin-only department and resource management */}
      {loggedInUser?.role === 'admin' && (
        <section className="dashboard-card">
          <h2>Admin Management</h2>
          <p>Add departments and shared resources to the platform.</p>

          <button
            type="button"
            onClick={() => {
              setShowDepartmentForm(!showDepartmentForm)
              setShowResourceForm(false)
              setAdminMessage('')
            }}
          >
            {showDepartmentForm ? 'Cancel' : 'Add Department'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowResourceForm(!showResourceForm)
              setShowDepartmentForm(false)
              setAdminMessage('')
            }}
          >
            {showResourceForm ? 'Cancel' : 'Add Resource'}
          </button>

          {adminMessage && (
            <p role="status" className="request-message">
              {adminMessage}
            </p>
          )}

          {showDepartmentForm && (
            <form onSubmit={handleAddDepartment}>
              <h3>Add Department</h3>

              <label htmlFor="newDepartmentName">Department Name</label>
              <input
                id="newDepartmentName"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                placeholder="e.g. Information Technology"
                required
              />

              <label htmlFor="newDepartmentCode">Department Code</label>
              <input
                id="newDepartmentCode"
                value={departmentCode}
                onChange={(event) => setDepartmentCode(event.target.value)}
                placeholder="e.g. IT"
                required
              />

              <label htmlFor="newDepartmentDescription">Description</label>
              <textarea
                id="newDepartmentDescription"
                value={departmentDescription}
                onChange={(event) =>
                  setDepartmentDescription(event.target.value)
                }
                placeholder="Department description"
              />

              <button type="submit" disabled={isSavingAdminData}>
                {isSavingAdminData ? 'Saving...' : 'Save Department'}
              </button>
            </form>
          )}

          {showResourceForm && (
            <form onSubmit={handleAddResource}>
              <h3>Add Resource</h3>

              <label htmlFor="newResourceName">Resource Name</label>
              <input
                id="newResourceName"
                value={resourceName}
                onChange={(event) => setResourceName(event.target.value)}
                placeholder="e.g. Robotics Kit"
                required
              />

              <label htmlFor="newResourceType">Resource Type</label>
              <select
                id="newResourceType"
                value={resourceType}
                onChange={(event) => setResourceType(event.target.value)}
                required
              >
                <option value="equipment">Equipment</option>
                <option value="room">Room</option>
                <option value="lab">Laboratory</option>
                <option value="other">Other</option>
              </select>

              <label htmlFor="newResourceDescription">Description</label>
              <textarea
                id="newResourceDescription"
                value={resourceDescription}
                onChange={(event) =>
                  setResourceDescription(event.target.value)
                }
                placeholder="Resource description"
              />

              <label htmlFor="newResourceDepartment">Department</label>
              <select
                id="newResourceDepartment"
                value={resourceDepartment}
                onChange={(event) =>
                  setResourceDepartment(event.target.value)
                }
                required
              >
                <option value="">-- Choose a department --</option>

                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>

              <button type="submit" disabled={isSavingAdminData}>
                {isSavingAdminData ? 'Saving...' : 'Save Resource'}
              </button>
            </form>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setShowRequestForm(!showRequestForm)
          setRequestMessage('')
          setAlternatives([])
        }}
      >
        {showRequestForm ? 'Cancel Request' : 'Request Resource'}
      </button>

      {requestMessage && (
        <p role="status" className="request-message">
          {requestMessage}
        </p>
      )}

      {/* Student resource request form */}
      {showRequestForm && (
        <section className="dashboard-card request-form-card">
          <h2>Request a Shared Resource</h2>

          <form onSubmit={handleRequestSubmit}>
            <label htmlFor="resource">Select Resource</label>
            <select
              id="resource"
              value={selectedResource}
              onChange={(event) => {
                setSelectedResource(event.target.value)
                setAlternatives([])
              }}
              required
            >
              <option value="">-- Choose a resource --</option>

              {resources.map((resource) => (
                <option
                  key={resource._id}
                  value={resource._id}
                  disabled={resource.availability === false}
                >
                  {resource.name}
                  {resource.availability === false ? ' (Unavailable)' : ''}
                </option>
              ))}
            </select>

            <label htmlFor="purpose">Purpose</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Explain why you need this resource"
              required
            />

            <label htmlFor="startDate">Start Date and Time</label>
            <input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />

            <label htmlFor="endDate">End Date and Time</label>
            <input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              min={startDate || undefined}
              required
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          {alternatives.length > 0 && (
            <div className="alternative-resources">
              <h3>Alternative Resources</h3>

              {alternatives.map((resource) => (
                <div key={resource._id}>
                  <p>
                    <strong>{resource.name}</strong>
                    {' — '}
                    {resource.department?.name || 'Department not specified'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResource(resource._id)
                      setAlternatives([])
                      setRequestMessage(
                        `Selected ${resource.name}. Submit the request again to try this resource.`
                      )
                    }}
                  >
                    Select Alternative
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Dashboard cards */}
      <section className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Departments</h2>

          {departments.length === 0 ? (
            <p>No departments found.</p>
          ) : (
            departments.map((department) => (
              <div key={department._id}>
                <h3>{department.name}</h3>
                <p>Code: {department.code}</p>
                <p>{department.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <h2>Shared Resources</h2>

          {resources.length === 0 ? (
            <p>No resources found.</p>
          ) : (
            resources.map((resource) => (
              <div key={resource._id}>
                <h3>{resource.name}</h3>
                <p>Type: {resource.type}</p>
                <p>{resource.description}</p>
                <p>
                  Department: {resource.department?.name || 'Not assigned'}
                </p>
                <p>
                  Availability: {resource.availability ? 'Available' : 'Unavailable'}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <h2>Resource Requests</h2>

          {requests.length === 0 ? (
            <p>No resource requests found.</p>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="request-item">
                <h3>
                  {request.resource?.name || 'Unknown Resource'}
                </h3>

                <p>Purpose: {request.purpose}</p>

                <p>
                  Start: {new Date(request.startDate).toLocaleString()}
                </p>

                <p>
                  End: {new Date(request.endDate).toLocaleString()}
                </p>

                <p>
                  Status:{' '}
                  <span className={`request-status status-${request.status}`}>
                    {request.status}
                  </span>
                </p>

                {request.requestedBy?.name && (
                  <p>Requested by: {request.requestedBy.name}</p>
                )}

                {/* Only admins see actions for pending requests */}
                {loggedInUser?.role === 'admin' &&
                  request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleRequestStatus(request._id, 'approved')
                        }
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRequestStatus(request._id, 'rejected')
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  ) : (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-icon">IR</div>

        <h1>Resource Sharing Platform</h1>

        <p className="subtitle">
          Interdepartmental Planning & Resource Sharing
        </p>

        <h2>Welcome Back</h2>

        <p className="login-description">
          Sign in to manage and share departmental resources.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <p className="login-message" role="status" aria-live="polite">
            {message}
          </p>
        )}

        <p className="footer-text">
          Easwari Engineering College
        </p>
      </section>
    </main>
  )
}

export default App
