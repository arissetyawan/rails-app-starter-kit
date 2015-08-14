Rails.application.routes.draw do
  # Only allow access via a subdomain.
  # Routes that do not need a subdomain should be placed outside these
  # constraints.
  constraints lambda { |r| r.subdomain.present? && r.subdomain != 'www' } do
    get 'home/index'

    devise_for :users,
               controllers: {
                   # Custom controllers needed to support multitenancy
                   sessions: 'sessions',
                   registrations: 'registrations',
                   # Comment this out if you don't want authentication via
                   # Facebook and/or other providers.
                   omniauth_callbacks: 'omniauth_callbacks'
               }

    namespace :api do
      namespace :users do
        # Devise API routes are set up to mirror default Devise routes
        devise_scope :user do
          post 'sign_in' => 'sessions#create'

          post 'sign_up' => 'registrations#create'
          delete '/' => 'registrations#destroy'
        end
      end
    end

    resources :posts

    resources :attachments

    resources :attachment_joins, only: [:create, :destroy]

    scope 'fine_uploader' do
      post 's3_signature' => 'fine_uploader#s3_signature'
      post 's3_upload_success' => 'fine_uploader#s3_upload_success'
    end

    namespace :admin do
      resources :posts, only: [:index, :destroy] do
        collection do
          post 'batch_destroy'
        end
      end

      resources :users, except: [:show] do
        collection do
          post 'batch_destroy'
        end
      end

      root 'home#index'
    end

    root 'home#index'
  end

  resources :tenants, only: [:create]
  resource :tenant, only: [:destroy]

  # Priority is based on order of creation: first created => highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions
  # automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
