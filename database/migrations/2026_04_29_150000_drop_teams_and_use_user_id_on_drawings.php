<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('drawings')->whereNull('creator_id')->delete();

        Schema::table('drawings', function (Blueprint $table) {
            $table->dropIndex(['team_id', 'updated_at']);
            $table->dropConstrainedForeignId('team_id');
            $table->dropForeign(['creator_id']);
        });

        Schema::table('drawings', function (Blueprint $table) {
            $table->renameColumn('creator_id', 'user_id');
        });

        Schema::table('drawings', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'updated_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_team_id');
        });

        Schema::dropIfExists('team_invitations');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');
    }

    public function down(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_personal')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->timestamps();

            $table->unique(['team_id', 'user_id']);
        });

        Schema::create('team_invitations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('role');
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_team_id')
                ->nullable()
                ->after('password')
                ->constrained('teams')
                ->nullOnDelete();
        });

        Schema::table('drawings', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'updated_at']);
            $table->dropForeign(['user_id']);
        });

        Schema::table('drawings', function (Blueprint $table) {
            $table->renameColumn('user_id', 'creator_id');
        });

        Schema::table('drawings', function (Blueprint $table) {
            $table->foreignId('creator_id')->nullable()->change();
            $table->foreign('creator_id')->references('id')->on('users')->nullOnDelete();
            $table->foreignId('team_id')->after('id')->constrained()->cascadeOnDelete();
            $table->index(['team_id', 'updated_at']);
        });
    }
};
