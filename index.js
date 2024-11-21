import { registerRootComponent } from 'expo';
import App from './App';

/**
 * Entry point for the application.
 *
 * This file is responsible for registering the root component of the app.
 *
 * - `registerRootComponent` ensures proper configuration of the app environment,
 *   whether it's running in the Expo Go environment or a standalone native build.
 * - It internally calls `AppRegistry.registerComponent` to register the `App` component as the main entry point.
 *
 * @module index
 */

// Register the main App component as the root of the application.
registerRootComponent(App);
