import Notification from './Notification.jsx'

function NotificationContainer({ notifications, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000 }}>
      {notifications.map((notification) => (
        <div key={notification.id} style={{ marginBottom: '8px' }}>
          <Notification
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => onRemove(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer
