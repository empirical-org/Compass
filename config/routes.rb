EmpiricalGrammar::Application.routes.draw do
  resources :categories
  resources :assignments
  resources :rules
  # resources :workbooks
  resources :lessons
  resources :assessments
  resources :chapters
  resource :profile

  resources :users do
    member do
      put :sign_in
    end
  end

  CMS::Routes.new(self).draw
  HoneyAuth::Routes.new(self).draw

  root to: "pages#home"
  get "teachers" => "pages#teachers"
  get "middle_school" => "pages#middle_school"
  get "story" => "pages#story"
  get "about" => "pages#about"
  get "learning" => "pages#learning"

  get "next_chapter" => "chapters#next"
  get "previous_chapter" => "chapters#previous"
  get "users/activate_email/:token", as: "activate_email", to: "users#activate_email"

  get "test" => "tests#index"
  post "score" => "tests#score"
end
