# Right to Read Admin Dashboard

A modern React-based admin dashboard for managing textbooks in the "Right to Read" program. Built with Material-UI for a clean, professional interface.

## Features

- **Dashboard Overview**: Real-time statistics showing total books, available stock, limited stock, and out-of-stock items
- **Textbook Management**: Browse, filter, and manage textbook inventory
- **Grade-based Organization**: Filter books by grade levels (9-12)
- **Modern UI**: Material-UI components with responsive design
- **Search Functionality**: Quick search across the textbook library
- **Status Tracking**: Visual indicators for book availability status

## Technology Stack

- **React 18** - Modern React with TypeScript
- **Material-UI (MUI)** - Component library for consistent design
- **TypeScript** - Type-safe development
- **React Scripts** - Build tooling and development server

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Right to Read"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from react-scripts (one-way operation)

## Project Structure

```
src/
├── App.tsx           # Main application component
├── App.css           # Custom styling
├── index.tsx         # Application entry point
└── index.css         # Global styles

public/
├── index.html        # HTML template
└── favicon.ico       # App icon
```

## Features in Detail

### Dashboard Statistics
- **Total Books**: Overview of entire textbook inventory
- **Available**: Books currently in stock and available for distribution
- **Limited Stock**: Books with low inventory levels
- **Out of Stock**: Books that need restocking

### Textbook Library
- **Grid View**: Visual card-based layout showing book covers
- **Status Indicators**: Color-coded chips showing availability status
- **Grade Filtering**: Dropdown to filter books by grade level
- **Quick Actions**: Filter and Create Book buttons for management

### Navigation
- **Sidebar Navigation**: Easy access to Dashboard, Account, and Settings
- **Search Bar**: Global search functionality
- **Notifications**: Badge indicator for system notifications
- **User Profile**: Quick access to user account

## Customization

### Theming
The app uses Material-UI's theming system. You can customize colors, typography, and spacing by modifying the theme in `src/index.tsx`.

### Adding New Features
- Add new navigation items in the `navigationItems` array
- Create new components in separate files and import them
- Extend the sample data structure for additional book properties

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
