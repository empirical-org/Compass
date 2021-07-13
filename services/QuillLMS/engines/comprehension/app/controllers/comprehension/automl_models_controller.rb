module Comprehension
  class AutomlModelsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :set_automl_model, only: [:show, :update, :activate, :destroy]

    # GET /automl_models.json
    def index
      @automl_models = Comprehension::AutomlModel.all
      @automl_models = @automl_models.where(prompt_id: params[:prompt_id]) if params[:prompt_id]
      @automl_models = @automl_models.where(state: params[:state]) if params[:state]

      render json: @automl_models
    end

    # GET /automl_models/1.json
    def show
      render json: @automl_model
    end

    # POST /automl_models.json
    def create
      @automl_model = Comprehension::AutomlModel.new(automl_model_params)
      @automl_model.populate_from_automl_model_id

      if @automl_model.save_with_session_user(lms_user_id)
        render json: @automl_model, status: :created
      else
        render json: @automl_model.errors, status: :unprocessable_entity
      end
    end


    # PATCH/PUT /automl_models/1.json
    def update
      if @automl_model.update(automl_model_params)
        render json: @automl_model, status: :ok
      else
        render json: @automl_model.errors, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /automl_models/1.json
    def activate
      if @automl_model.activate_with_session_user(lms_user_id)
        head :no_content
      else
        render json: @automl_model, status: :unprocessable_entity
      end
    end

    # DELETE /automl_models/1.json
    def destroy
      @automl_model.destroy
      head :no_content
    end

    private def set_automl_model
      @automl_model = Comprehension::AutomlModel.find(params[:id])
    end

    private def automl_model_params
      params.require(:automl_model).permit(:automl_model_id, :prompt_id, :notes)
    end
  end
end
